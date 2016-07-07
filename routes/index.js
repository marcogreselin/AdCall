var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(req.headers['x-forwarded-proto'] === 'https') {
    res.render('index');
  } else {
    res.redirect('https://adcall.io');
  }
});

// GET login page.
router.get('/login', function(req, res, next) {
  res.render('login');
});

// GET signup page.
router.route('/signup')
.get(function(req, res, next) {
  res.render('signup', { type: 'question' })
})
.post(function(req, res, next) {
  res.render('signup', {type: req.type});
})

// GET login page.
router.get('/signup/advertiser', function(req, res, next) {
  res.render('signup-advertiser');
});

// GET login page.
router.get('/signup/publisher', function(req, res, next) {
  res.render('signup-publisher');
});

// console routes
router.get('/console', function(req, res) {
  res.render('console/');
});

router.get('/console/analytics', function(req, res) {
  res.render('console/analytics');
});

// console advertiser
router.get('/console/answer', function(req, res) {
  res.render('console/answer');
});

router.get('/console/my-ads', function(req, res) {
  res.render('console/my-ads');
});


// console publisher
router.get('/console/snippet', function(req, res) {
  res.render('console/snippet');
});


module.exports = router;
