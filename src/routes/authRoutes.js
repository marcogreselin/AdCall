var express = require('express');
var router = express.Router();
var pg = require('pg');

router.route('/signup')
    .post(function (req, res) {
        console.log(req.body);



        pg.defaults.ssl = true;
        pg.connect('postgres://srluuemmvrruax:6_KdnWlAOLemnOl8otCtm-7JhH@ec2-54-243-48-181.compute-1.amazonaws.com:5432/dbb08efco22k2q' , function(err, client) {
            if (err) throw err;
            console.log('Connected to postgres! Getting schemas...');

            client
                .query('INSERT INTO userta (companyname, username, password, address, phone) VALUES (\'comps\', \'un\', \'pw\', \'add\', \'ph\');')
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
