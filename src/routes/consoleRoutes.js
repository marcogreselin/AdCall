var express = require('express');
var router = express.Router();
var pg = require('pg');
var express = require('express');
var app = express();

// console routes

router.use(function (req, res, next) {
    if(typeof req.user === "undefined"){
        res.redirect('/');
    } else {
        next();
    }

});



// From http://stackoverflow.com/questions/15719116/verify-access-group-in-passport-js
var assignedUser = function() {
    return function(req, res, next) {
        if (req.user && req.user.companyid != null)
            next();
        else
            res.redirect('/console/setup');
    };
};

router.get('/', assignedUser(), function(req, res) {
    res.render('console/');
});

router.route('/setup')
    .get(function(req, res) {
        // pg.defaults.ssl = true;
        // pg.connect(process.env.DATABASE_URL || `postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
        //     `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
        //     if (err) {
        //         console.log('Connection issue when retrieving data: ' + JSON.stringify(err));
        //     } else {
        //         client
        //             .query(`SELECT companyId, companyname FROM company`, function (err, result) {
        //                 res.render('console/setup', result);
        //             });
        //     }
        // })

        res.render('console/setup',req.user)
    })
    .post(function(req, res) {
        console.log(JSON.stringify(req.user))
        // var selectedCompany = req.body.selectedCompany;
        // var userId = req.user.agentid;
        pg.defaults.ssl = true;
        pg.connect(process.env.DATABASE_URL || `postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
            `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
            if (err) {
                console.log('Connection issue when retrieving data: ' + JSON.stringify(err));
            } else {
                client
                    .query(`INSERT INTO company (companyname, companytype, address1, address2, postcode, city, country, createdby)
                        VALUES ('${req.body.companyname}', ${req.body.companytype}, '${req.body.address1}', '${req.body.address2}', 
                        '${req.body.postcode}', '${req.body.city}', '${req.body.country}', ${req.user.agentid});
                        UPDATE agent SET companyid=(SELECT companyid from company WHERE createdby = ${req.user.agentid});
                        SELECT companyid FROM agent WHERE agentid = ${req.user.agentid}`,
                        function (err, result) {
                            if(err)
                                console.log(err.toString());
                            // Now that the companyid has been added we should add it to the user object
                            console.log(JSON.stringify(result))
                            console.log(JSON.stringify(req.user))
                            req.user.companyid = result.rows[0].companyid;
                            res.redirect('/console');
                        });
            }
        })
    });

router.get('/analytics', assignedUser(), function(req, res) {
    res.render('console/analytics');
});

// console advertiser
router.get('/answer', assignedUser(), function(req, res) {
    res.render('console/answer');
});

router.get('/my-ads', assignedUser(), function(req, res) {
    res.render('console/my-ads');
});


// console publisher
router.get('/snippet', assignedUser(), function(req, res) {
    res.render('console/snippet');
});

module.exports = router;