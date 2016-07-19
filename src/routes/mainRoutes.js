var express = require('express');
var router = express.Router();
var flash = require('connect-flash');


// Redirect users that are logged in to the console.
// Ever other route is blocked exchept for auth that we need to logout
var consoleRedirect = function(req,res,next){
  var url = req.originalUrl;
  if(req.user && (!url.match(/\/console*|\/auth*/g) || !url)){
    res.redirect('/console');
  } else {
    next();
  }
};
router.use(consoleRedirect);

router.get('/', function(req, res, next) {
  res.render('index');
});

// GET login page.
router.get('/login', function(req, res, next) {
  res.render('login', {message: req.flash('error')});
});

// GET signup page.
router.route('/signup')
.get(function(req, res, next) {
  res.render('signup')
});

// GET login page.
router.get('/signup/advertiser', function(req, res, next) {
  res.render('signup-advertiser');
});

// GET login page.
router.get('/signup/publisher', function(req, res, next) {
  res.render('signup-publisher');
});

module.exports = router;