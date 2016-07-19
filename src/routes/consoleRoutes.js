var express = require('express');
var router = express.Router();
var pg = require('pg');
var express = require('express');
var app = express();

// console routes

// If not logged in redirect to root
router.use(function (req, res, next) {
    if(typeof req.user === "undefined"){
        res.redirect('/');
    } else {
        next();
    }
});


// Console Access Policies
// If user is not assigned to a company redirect all request to console to setup page.
// From http://stackoverflow.com/questions/15719116/verify-access-group-in-passport-js
var assignedUser = function() {
    return function(req, res, next) {
        if (req.user && req.user.companyid != null)
            next();
        else if (req.originalUrl === '/console/setup')
            next();
        else
            res.redirect('/console/setup');
    };
};

// Menu for header
var nav = function() {
    return function(req,res,next) {
        res.nav = [];
        var advertisernav = [{
                link: '../console/my-ads',
                text: 'My Ads'
            },
            {
                link: '../console/answer',
                text: 'Answer Calls'
            }];
        var publishernav = [{
            link: '../console/snippet',
            text: 'Snippet'
        }];
        var agency = [{
            link: '../console/create',
            text: 'Create Campaign'
        }];
        if (req.user && req.user.companyid != null){
            if(req.user.companytype === 1)
                res.locals.nav = advertisernav;
            else if(req.user.companytype === 2)
                res.locals.nav = publishernav;
            else if(req.user.companytype === 3)
                res.locals.nav = agencynav;
        }
        next();
    }
};

// Allows to send selected user data to response if logged in
function userData(req, res, next)  {
    if(req.user && req.user.firstname){
        res.locals.userfirstname = req.user.firstname;
    }
    next();
};

router.use(userData);
router.use(nav());
router.use(assignedUser());

router.get('/', function(req, res) {
    res.render('console/');
});

router.route('/setup')
    .get(nav(), function(req, res) {
        var email = req.user.email;
        res.locals.email = email;
        res.render('console/setup')
    })
    .post(function(req, res) {
        pg.defaults.ssl = true;
        pg.connect(process.env.DATABASE_URL || `postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
            `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
            if (err) {
                console.log('Connection issue when retrieving data: ' + JSON.stringify(err));
            } else {
                client.query(`INSERT INTO company (companyname, companytype, address1, address2, postcode, city, country, createdby)
                VALUES ('${req.body.companyname}', ${req.body.companytype}, '${req.body.address1}', '${req.body.address2}', 
                '${req.body.postcode}', '${req.body.city}', '${req.body.country}', ${req.user.agentid});
                UPDATE agent SET companyid=(SELECT companyid from company WHERE createdby = ${req.user.agentid}) WHERE agentid = ${req.user.agentid};
                SELECT companyid FROM agent WHERE agentid = ${req.user.agentid}`,
                function (err, result) {
                    if(err)
                        console.log(err.toString());
                    // Now that the companyid has been added we should add it to the user object
                    // console.log(JSON.stringify(result))
                    // console.log(JSON.stringify(req.user))
                    req.user.companyid = result.rows[0].companyid;
                    req.user.companytype = result.rows[0].companytype;
                    res.redirect('/console');
                });
            }
        })
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