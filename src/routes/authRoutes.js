var express = require('express');
var router = express.Router();
var pg = require('pg');
var passport = require('passport');
var bcrypt = require('bcrypt');

router.route('/signup')
    .post(function (req, res, next) {
        pg.defaults.ssl = true;
        pg.connect(process.env.DATABASE_URL || `postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
            `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
            if (err){
                console.log("Error reaching DB when creating account "+err['detail']);
                res.redirect('/');
            } else {
                const saltRounds = 10;
                const plaintextPassword = req.body.password
                // Hash the password
                bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
                    if (err){
                        console.log("Error when hashing password during registration. " + err);
                        res.redirect('/');
                    } else {

                        client
                            .query(`INSERT INTO agent (admin, email, password, firstname, lastname)
                VALUES (false, '${req.body.email}', '${hash}', '${req.body.firstname}', '${req.body.lastname}');`, function(err, result) {
                                if(err) {
                                    if (err.constraint) {
                                        console.log(err);
                                        res.redirect('/');
                                    } else {
                                        console.log(err);
                                        res.redirect('/');
                                    }
                                } else {
                                    // If the user is created correctly we will log her in using passport.
                                    // Not needed when logging in.
                                    res.login(req.body, function(){
                                        res.redirect('../console');
                                    });
                                }
                            });

                    }
                });



            }

        });

    });

router.route('/login')
    .post(passport.authenticate('local-login', {
        successRedirect: '/console',
        failureFlash: true,
        failureRedirect: '/login' // if signup does not work, I will go to '/'
    }));


router.route('/logout')
    .get(function(req, res){
        req.logout();
        res.redirect('/');
    });

module.exports = router;