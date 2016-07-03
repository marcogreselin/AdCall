var express = require('express');
var router = express.Router();

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

// console advertiser
router.get('/console/create-ad', function(req, res) {
  res.render('console/create-ad');
});

router.get('/console/answer', function(req, res) {
  res.render('console/create-ad');
});

router.get('/console/my-ads', function(req, res) {
  res.render('console/create-ad');
});


// console publisher
router.get('/console/my-snippet', function(req, res) {
  res.render('console/create-ad');
});

module.exports = router;
