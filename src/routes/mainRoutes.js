var express = require('express');
var router = express.Router();
var flash = require('connect-flash');

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