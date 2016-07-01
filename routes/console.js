var express = require('express');
var router = express.Router();

// GET console home
router.get('/', function(req, res) {
  res.send('Welcome to our API!');
});

module.exports = router;
