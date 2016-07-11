var express = require('express');
var router = express.Router();
var pg = require('pg');
var passport = require('passport')

router.route('/signup')
    .post(function (req, res, next) {
        pg.defaults.ssl = true;
        pg.connect(process.env.DATABASE_URL || `postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
            `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
            if (err){
                console.log(err['detail']);
                res.status(500).send('The connection to the database went wrong.');
                console.log('first');
            } else {
                client
                    .query(`INSERT INTO agent (admin, email, password, firstname, lastname)
                VALUES (false, '${req.body.email}', '${req.body.password}', '${req.body.firstname}', '${req.body.lastname}');`, function(err, result) {
                        if(err) {
                            if (err.constraint) {
                                console.log(err);
                                res.status(500).send("This email address is already registered with us.");
                            } else {
                                console.log(err);
                                res.status(500).send("Something is wrong. Contact us!");
                            }
                        } else {
                            // If the user is created correctly we will log her in using passport.
                            // Not needed when logging in.
                            req.login(req.body, function(){
                                res.redirect('/auth/profile');
                            });
                        }
                    });
            }

        });

    });

router.route('/login')
    .post(passport.authenticate('local', {
        failureRedirect: '/' // if signup does not work, I will go to /
    }), function(req, res){ // if signup works fine, I will go to profile
        console.log('user logged in');
        res.redirect('../console');
    });


router.route('/logout')
    .get(function(req, res){
        req.logout();
        res.redirect('/');
    });

module.exports = router;