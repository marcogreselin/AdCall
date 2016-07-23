var express = require('express');
var router = express.Router();
var pg = require('pg');
var passport = require('passport');
var bcrypt = require('bcrypt');

router.route('/signup')
    .post(passport.authenticate('local-signup', {
        successRedirect: '/console',
        failureFlash: true,
        failureRedirect: '/signup' // if signup does not work, I will go back to signup
    }));

router.route('/login')
    .post(passport.authenticate('local-login', {
        successRedirect: '/console',
        failureFlash: true,
        failureRedirect: '/login' // if login does not work, I will go back to login
    }));


router.route('/logout')
    .get(function(req, res){
        req.logout();
        res.redirect('/');
    });

module.exports = router;