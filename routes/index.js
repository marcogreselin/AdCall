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

module.exports = router;
