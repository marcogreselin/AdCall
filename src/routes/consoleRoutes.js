var express = require('express');
var router = express.Router();

// console routes

router.use(function (req, res, next) {
    if(!req.user){
        res.redirect('/');
    }
    next();
})
router.get('/', function(req, res) {
    res.render('console/');
});

router.get('/analytics', function(req, res) {
    res.render('console/analytics');
});

// console advertiser
router.get('/answer', function(req, res) {
    res.render('console/answer');
});

router.get('/my-ads', function(req, res) {
    res.render('console/my-ads');
});


// console publisher
router.get('/snippet', function(req, res) {
    res.render('console/snippet');
});

module.exports = router;