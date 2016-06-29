var express = require('express');
var router = express.Router();


var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
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

/* GET home page. */
router.get('/', auth, function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// GET login page.
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

module.exports = router;
