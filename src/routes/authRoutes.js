var express = require('express');
var router = express.Router();
var pg = require('pg');

router.route('/signup')
    .post(function (req, res) {
        console.log(req.body);



        pg.defaults.ssl = true;
        pg.connect(process.env.DATABASE_URL || 'postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah', function(err, client) {
            if (err) throw err;
            console.log('Connected to postgres! Getting schemas...');

            client
                .query(`INSERT INTO agent (admin, email, password, firstname, lastname, position) 
                VALUES (true, 'marcogresemnmlin@me.com\', 'gallome33-', 'Marco', 'Greselin', 'CEO');`, function(err, result) {
                    if(err){
                        console.log(err);
                    }
                })
                .on('row', function(row) {
                    console.log(JSON.stringify(row));
                });
        });


        req.login(req.body, function(){
            res.redirect('/auth/profile');
        });
    });
router.route('/profile')
    .get(function(req, res){
        res.json(req.user);


    });

module.exports = router;
