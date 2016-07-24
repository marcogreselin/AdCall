var express = require('express');
var router = express.Router();
var queries = require('../db/queries');


/**
 * Redirect visitors who are not logged in and try to visit the Console.
 */
router.use(function (req, res, next) {
    if(typeof req.user === "undefined"){
        res.redirect('/');
    } else {
        next();
    }
});

/**
 * If user is not assigned to a company redirect all request to console to setup page.
 * @returns {Function}
 */
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

/**
 *  Menu for header
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

/**
 * Allows to send selected user data to response if logged in.
 */
function userData(req, res, next)  {
    if(req.user && req.user.firstname){
        res.locals.agentfirstname = req.user.firstname;
        res.locals.agentid = req.user.agentid;
    }
    next();
};

/**
 *  Adding the route name so that it can be used in the header to underline
 *  current page.
 */
function routeName (req, res, next) {
    res.locals.originalUrl = req.originalUrl;
    next();
}

router.use(userData);
router.use(nav());
router.use(assignedUser());
router.use(routeName);

/**
 * Handy to restrict access of each route.
 * @param companyType
 * @returns {Function}
 * @todo add support for parsing arrays of user types.
 */
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

/*
 * Beginning of routes. The db object has all the queries.
 */

/**
 * The Console Home.
 */
router.get('/', function(req, res) {
    res.render('console/');
});

/**
 * The setup route is only visible if the user is not associated with a company.
 * It is necessary to complete this form to move forward to the console.
 * This applies to all kinds of agents.
 */
router.route('/setup')
    .get(function(req, res) {
        if(req.user.companyid != null){
            res.redirect('console/');
        } else {
            res.render('console/setup', {email: req.user.email})
        }
    })
    .post(queries.postSetup);

/*
 * The following are interfaces for the Advertisers.
 */

/**
 * Used by Advertisers to answer calls.
 */
router.get('/answer', restrictTo('advertiser'), function(req, res) {
    res.render('console/answer');
});

/**
 * Advertisers can see, add and delete campaigns to their company.
 */
router.route('/campaigns')
    .get(restrictTo('advertiser'), restrictTo('admin'), queries.getCampaigns)
    .post(queries.createCampaign);

/*
 * The following are interfaces for the Publishers.
 */

/**
 * This snippet page is used by Advertisers to copy the HTML code into their pages.
 */
router.get('/snippet', restrictTo('publisher'), function(req, res) {
    res.render('console/snippet');
});


/*
 * The following are interfaces for the Admins.
 */

/**
 * Agents can be added to the Company by the Company Admins.
 */
router.route('/agents')
    .get(restrictTo('admin'), queries.getAgents)
    .post(queries.createAgent);
/**
 * External routes are added here. They include calls to services like S3.
 */
require('./externalRoutes')(router);

module.exports = router;