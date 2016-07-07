var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var routes = require('./routes/index');
var vhost = require('vhost');

// var users = require('./routes/users');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// favicon
app.use(favicon(path.join(__dirname, 'public','images', 'favicon.ico')));

// // Redirect http requests from http://jaketrent.com/post/https-redirect-node-heroku/
app.use(function(req, res, next) {
  if(req.headers['x-forwarded-proto'] != 'https') {
    console.log(req.get('X-Forwarded-Port')+" "+" "+req.headers['x-forwarded-proto']+' lets seenew '+req.get('host') + req.originalUrl);
    res.redirect('https://' + req.get('host') + req.originalUrl);
  }
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

// various stuff
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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
app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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





// Redirect Consol app
// var redirect = express();
//
// redirect.use(function(req, res){
//   if (!module.parent) console.log(req.vhost);
//   res.render('http://www.nyt.com');
// });
//
// app.use(vhost('console.adcall.io', redirect));
module.exports = app;