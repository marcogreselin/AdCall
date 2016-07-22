var express = require('express');
var router = express.Router();
var pg = require('pg');
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

/** Menu for header
 *
 */
var nav = function() {
    return function(req,res,next) {
        res.nav = [];
        var advertisernav = [{
                link: '../console/answer',
                text: 'Answer Calls'
            }];
        var publishernav = [{
            link: '../console/snippet',
            text: 'Snippet'
        }];
        var agencynav = [{
            link: '../console/create',
            text: 'Create Campaign'
        }];
        var adminnav = {
            link: '../console/agents',
            text: 'Add Agents'
        }
        if (req.user && req.user.companyid != null){
            if(req.user.companytype === 1)
                res.locals.nav = advertisernav;
            else if(req.user.companytype === 2)
                res.locals.nav = publishernav;
            else if(req.user.companytype === 3)
                res.locals.nav = agencynav;
            // If the user is an admin of that account,
            // she should be able to add other users to that company.
            if(req.user.admin === true){
                // If the user is an advertiser admin,
                // she will be able to create and manager ads.
                if(req.user.companytype === 1){
                    res.locals.nav.push({
                        link: '../console/campaigns',
                        text: 'My Campaigns'
                    });
                }
                res.locals.nav.push(adminnav);
            }
        }
        next();
    }
};

/** Allows to send selected user data to response if logged in.*/
function userData(req, res, next)  {
    if(req.user && req.user.firstname){
        res.locals.agentfirstname = req.user.firstname;
        res.locals.agentid = req.user.agentid;
    }
    next();
};

/** Adding the route name so that it can be used in the header to underline
 * current page.
 */
function routeName (req, res, next) {
    res.locals.originalUrl = req.originalUrl;
    next();
}

router.use(userData);
router.use(nav());
router.use(assignedUser());
router.use(routeName);

var restrictTo = function (companyType) {
    return function (req,res,next) {
        var _companyType;
        if (companyType === 'advertiser') {
            _companyType = 1;
        } else if (companyType === 'publisher') {
            _companyType = 2;
        } else if (companyType === 'agency'){
            _companyType = 3;
        }
        if(_companyType === req.user.companytype){
            next();
        } else if(companyType === 'admin') {
            if(req.user.admin===true)
                return next();
            else
                res.redirect('/console');
        } else {
            res.redirect('/console');
        }
    }
};

router.get('/', function(req, res) {
    res.render('console/');
});

router.route('/setup')
    .get(function(req, res) {
        // This page should be accessible only if an agent has not been associated to a company.
        if(req.user.companyid != null){
            res.redirect('console/');
        } else {
            var email = req.user.email;
            res.locals.email = email;
            res.render('console/setup')
        }
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
                UPDATE agent SET companyid=(SELECT companyid from company WHERE createdby = ${req.user.agentid}), admin=true WHERE agentid = ${req.user.agentid};
                SELECT company.companyid, company.companytype FROM agent JOIN company ON company.companyid=agent.companyid WHERE agentid = ${req.user.agentid}`,
                function (err, result) {
                    if(err)
                        console.log(err.toString());
                    // Now that the companyid has been added we should add it to the user object
                    req.user.companyid = result.rows[0].companyid;
                    req.user.companytype = result.rows[0].companytype;
                    res.redirect('/console');
                });
            }
        })
    });

// console advertiser
router.get('/answer', restrictTo('advertiser'), function(req, res) {
    res.render('console/answer');
});

router.route('/campaigns')
    .get(restrictTo('advertiser'), function(req, res) {
        pg.defaults.ssl = true;
        pg.connect(`postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
            `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
            if (err) {
                console.log('Connection issue when retrieving data, error will be thrown: ' + JSON.stringify(err));
                throw err;
            } else {
                client.query(`SELECT * FROM campaign WHERE agentid = ${req.user.agentid};`,
                    function (err, result) {
                        if(err)
                            console.log(err.toString());
                        res.render('console/campaigns', result);
                    });
            }
        })
    })
    .post(function (req, res) {
        pg.defaults.ssl = true;
        pg.connect(`postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
            `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
            if (err) {
                console.log('Connection issue when retrieving data, error will be thrown: ' + JSON.stringify(err));
                throw err;
            } else {
                client.query(`INSERT INTO campaign (agentid, title, image, impressions, fallback)
                VALUES (${req.user.agentid}, '${req.body.title}', '${req.body.bannerurl}', '${req.body.impressions}', '${req.body.fallback}')`,
                    function (err, result) {
                        if(err)
                            console.log(err.toString());
                        // Now that the companyid has been added we should add it to the user object
                        res.redirect('/console/campaigns');
                    });
            }
        })
    });

// console publisher
router.get('/snippet', restrictTo('publisher'), function(req, res) {
    res.render('console/snippet');
});

router.route('/agents')
    .get(restrictTo('admin'), function (req, res) {
        pg.defaults.ssl = true;
        pg.connect(`postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
            `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
            if (err) {
                console.log('Connection issue when retrieving data, error will be thrown: ' + JSON.stringify(err));
                throw err;
            } else {
                client.query(`SELECT * FROM agent WHERE companyid = (SELECT companyid FROM agent WHERE agentid=${req.user.agentid})`, function(err,result){
                    res.render('console/agents', result);
                });
            }
        });
    })
    .post(function(req, res){
        pg.defaults.ssl = true;
        pg.connect(`postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
            `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
            if (err) {
                console.log('Connection issue when retrieving data, error will be thrown: ' + JSON.stringify(err));
                throw err;
            } else {
                client.query(`SELECT * FROM agent WHERE email='${req.body.email}';`, function(err,result){
                    console.log('email looked up: ' +`'${req.body.email}'`);
                    if(result.rows.length!=0){
                        console.log(JSON.stringify(result));
                        client.query(`UPDATE agent SET  companyid=${req.user.companyid} WHERE email='${req.body.email}';`,
                            function (err, result) {
                                if(err)
                                    console.log(err.toString());
                                else {
                                    res.status(200).send('All Good');
                                    console.log('here');
                                }
                            });
                    } else {
                        console.log('user not found');
                        res.status(500).send('Email not found!');

                    }
                });

            }
        })
    });

require('./externalRoutes')(router);

module.exports = router;