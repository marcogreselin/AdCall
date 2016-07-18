var express = require('express');
var router = express.Router();
var flash = require('connect-flash');

router.get('/', function(req, res, next) {
  // if(req.headers['x-forwarded-proto'] === 'https') {
  //   res.render('index');
  // } else {
  //   res.redirect('https://adcall.io');
  // }
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
// .post(function(req, res, next) {
//   res.render('signup', {type: req.type});
// })

// GET login page.
router.get('/signup/advertiser', function(req, res, next) {
  res.render('signup-advertiser');
});

// GET login page.
router.get('/signup/publisher', function(req, res, next) {
  res.render('signup-publisher');
});

module.exports = router;