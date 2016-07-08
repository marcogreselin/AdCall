var express = require('express');
var router = express.Router();

router.route('/signup')
    .post(function (req, res) {
        console.log(req.body);
        req.login(req.body, function(){
            res.redirect('/auth/profile');
        });
    });
router.route('/profile')
    .get(function(req, res){
        res.json(req.user);
    });

module.exports = router;
