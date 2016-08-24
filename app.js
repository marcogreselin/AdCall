var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var mainRoutes = require('./src/routes/mainRoutes');
var consoleRoutes = require('./src/routes/consoleRoutes');
var serveRoutes = require('./src/routes/serveRoutes');
var authRoutes = require('./src/routes/authRoutes');
var redisUrl = require('redis-url');
var RedisStore = require('connect-redis')(session);
var flash = require ('connect-flash');

var app = express();

// // redirect console users
// app.use(vhost('console.adcall.io', require('./consoleApp').app));

// view engine setup
app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');

// favicon
app.use(favicon(path.join(__dirname, 'public','images', 'favicon.ico')));

// Redirect HTTP requests inspired by http://jaketrent.com/post/https-redirect-node-heroku/
app.use(function(req, res, next) {
  if(req.headers['x-forwarded-proto'] === 'http' && app.get('env') != 'development') {
    res.redirect('https://' + req.get('host') + req.originalUrl);
  }
  next();
});

// app password protection
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'adcall' && user.pass === 'adcall') {
    return next();
  } else {
    return unauthorized(res);
  };
};
app.use(auth);

// various middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Sets up a session store with Redis
app.sessionStore = new RedisStore({
  client: redisUrl.connect(process.env.REDIS_URL)
});
app.use(session({
  store: app.sessionStore,
  secret: 'buttery',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
require('./src/config/passport')(app);


// sass compiler
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));

// serve static files
app.use(express.static(path.join(__dirname, 'public'), { defaultExtension: 'html' }));

// serve routes
app.use('/', mainRoutes);
app.use('/console', consoleRoutes);
app.use('/auth', authRoutes);
app.use('/serve', serveRoutes);
app.get('/demo', function (req, res) {
  res.redirect('demo.html')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
  res.redirect('/');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;