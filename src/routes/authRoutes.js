var express = require('express');
var router = express.Router();
var pg = require('pg');

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
                        if(err.constraint){
                            console.log(err);
                            res.status(500).send("This email address is already registered with us.");
                        } else if (err){
                            console.log(err);
                            res.status(500).send("Something is wrong. Contact us!");
                        }
                    });
            }

        });
        // req.login(req.body, function(){
        //     res.redirect('/auth/profile');
        // });
    });
router.route('/profile')
    .get(function(req, res){
        res.json(req.user);
    });

module.exports = router;