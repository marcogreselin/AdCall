/**
 * Created by marco on 23/07/2016.
 */
// More info on pg-promise on https://github.com/vitaly-t/pg-promise
var pgp = require('pg-promise')();
const url = require('url');
const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');
const cn = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true
};
var db = pgp(cn);

/**
 * It's an object containing all queries needed.
 */
module.exports = {
    /**
     * Used by Passport to log in.
     * @param email
     * @returns {XPromise<any>|external:Promise|*}
     * @see local.strategy
     */
    passportLogin: email=> {
        return db.one(`SELECT agentid, agent.companyid, companytype, admin, email, firstname, lastname, password, verified 
                FROM agent LEFT JOIN company ON agent.companyid = company.companyid
                WHERE email='${email}'`);
    },
    /**
     * Used by Passport to sign up.
     * @param email
     * @returns {XPromise<any>|external:Promise|*}
     * @see local.strategy
     * @todo Refactor so that there is only one query for each query.
     */
    passportSignUp: userData => {
        return db.one(`INSERT INTO agent (admin, email, password, firstname, lastname)
                       VALUES (false, '${userData.email}', '${userData.hashedPassword}', '${userData.firstName}', '${userData.lastName}');
                       SELECT * FROM agent WHERE email = '${userData.email}'`);
    },

    /**
     * Used to associate a company to each user.
     */
    postSetup: function (req, res) {
        db.task(t=> {
            return t.none(`INSERT INTO company (companyname, companytype, address1, address2, postcode, city, country, createdby)
                VALUES ('${req.body.companyname}', ${req.body.companytype}, '${req.body.address1}', '${req.body.address2}', 
                '${req.body.postcode}', '${req.body.city}', '${req.body.country}', ${req.user.agentid});`)
                .then(() => {
                    return t.any(`UPDATE agent SET companyid=(SELECT companyid from company WHERE createdby = ${req.user.agentid}), admin=true WHERE agentid = ${req.user.agentid};`)
                })
                .then(() => {
                    return t.one(`SELECT company.companyid, company.companytype, agent.admin FROM agent JOIN company ON company.companyid=agent.companyid WHERE agentid = ${req.user.agentid};`)
                })
        })
            .then( result => {
                req.user.companyid = result.companyid;
                req.user.companytype = result.companytype;
                req.user.admin = result.admin;
                res.redirect('/console');
            })
            .catch( error => {
                console.log(`Error when getting set up from agent ${req.user.agentid}: ` + error);
                res.redirect('/console');
            })
    },
    /**
     * This mw is used to display the campaigns of a given company.
     * @param req
     * @param res
     */
    getCampaigns: function  (req, res) {
        db.any(`SELECT * FROM campaign WHERE agentid IN (SELECT agentid FROM agent WHERE companyid = ${req.user.companyid});`)
            .then( result => {
                res.locals.rows = result;
                res.render('console/campaigns');
            })
            .catch( error => {
                console.log(`Error when trying to query the list of campaigns for user ${req.user.agentid}: ` + error.toString());
                res.redirect('/console/campaigns');
            })
    },
    /**
     * Used to create a new campaign.
     * @todo Add Validation rules in backend.
     */
    createCampaign: function (req, res) {
        db.none(`INSERT INTO campaign (agentid, title, image, impressions, fallback)
                VALUES (${req.user.agentid}, '${req.body.title}', '${req.body.bannerurl}', '${req.body.impressions}', '${req.body.fallback}');`)
            .then( ()=> {
                res.redirect('/console/campaigns');
            })
            .catch( error => {
                console.log(`Error when creating a campaign from agent ${req.user.agentid}. Error: ` + error.toString());
                res.redirect('/console/campaigns');
            })
    },
    /**
     * Used to get the list of agents.
     */
    getAgents: function(req, res) {
        db.any(`SELECT * FROM agent WHERE companyid = (SELECT companyid FROM agent WHERE agentid=${req.user.agentid}) ORDER BY admin DESC`)
            .then( result => {
                res.locals.rows = result;
                res.render('console/agents');
            })
            .catch( error => {
                console.log(`Error when trying to retrieve the list of campaigns for user ${req.user.agentid}: ` + error.toString());
                res.redirect('/console/agents');
            })
    },
    /**
     * Used to create new agents.
     * @todo Add Validation rules in backend.
     */
    createAgent: function(req, res) {
        db.one(`SELECT * FROM agent WHERE email='${req.body.email}' AND companyid IS NULL;`)
        // If returns one row, it means that the user exists  and it is not matched to any company.
            .then( ()=> {
                db.none(`UPDATE agent SET  companyid=${req.user.companyid} WHERE email='${req.body.email}';`)
                    .then( ()=> {
                        res.status(200).send();
                    })
                    // This fires if there's an error when changing the company from null to defined.
                    .catch( error => {
                        console.log(`Error when adding company to user ${req.body.email} from user ${req.user.agentid}: ` + JSON.stringify(error));
                        res.status(500).send();
                    })
            })
            // This is fired if the first query returns more than one row or there's a problem.
            .catch( error => {
                res.status(500).send('User is already matched to company: ' + error);
            })
    },
    makeAdmin: function(req,res) {
        db.none(`UPDATE agent SET admin=NOT admin WHERE agentid=${req.query.agentId};`)
            .then( ()=> {
                res.redirect("/console/agents");
            })
            .catch( error => {
                console.log(`Error when changing admin status for ${req.query.agentId}: `+error);
                res.redirect("/console/agents");
            })
    },
    unmatchAgent: function(req,res) {
        db.none(`UPDATE agent SET companyid=null WHERE agentid=${req.query.agentId};`)
            .then( ()=> {
                res.redirect("/console/agents");
            })
            .catch( error => {
                console.log(`Error when unmatching user ${req.query.agentId}: `+error);
                res.redirect("/console/agents");
            })
    },
    suspendCampaign: function(req,res){
        db.none(`UPDATE campaign SET suspended=NOT suspended WHERE campaignId=${req.query.campaignId};`)
            .then( ()=> {
                res.redirect("/console/campaigns");
            })
            .catch( error => {
                console.log(`Error when (un)pausing campaign ${req.query.campaignId}: `+error);
                res.redirect("/console/campaigns");
            })
    },
    serveBanner: function(req, res){
        db.one(`SELECT image, fallback, campaignid, companyId FROM campaign 
                JOIN agent ON agent.agentid=campaign.agentid 
                WHERE suspended=false ORDER BY RANDOM() LIMIT 1;`)
            .then( result => {
                db.none(`INSERT INTO impression (campaignid, publisherid) VALUES (${result.campaignid}, ${req.query.publisherId});`)
                    .then( ()=> {
                        res.send(result);
                    } )
                    .catch( error =>{
                        console.log('Something went wrong when inserting an impression: '+error)
                    } )
            } )
            .catch( error=>{
                console.log('Something went wrong when retrieving an ad: '+error)
            } )
    },
    publisherImpressionCount: function(req, res){
        db.any(`SELECT TO_CHAR(createddate, 'DD-MM-YY') AS date, COUNT(*) FROM impression WHERE publisherid=${req.user.companyid} 
                GROUP BY date ORDER BY date DESC LIMIT 7`)
            .then( result => {
                res.locals.impressionsData = result;
                res.render('console/')
            } )
            .catch( error=>{
                console.log('Something went wrong when retrieving the console data: '+error)
            } )
    },
    advertiserImpressionCount: function(req, res){
        db.any(`SELECT TO_CHAR(impression.createddate, 'DD-MM-YY') AS date, COUNT(*)
        FROM impression JOIN campaign ON campaign.campaignid=impression.campaignid JOIN agent ON agent.agentid=campaign.agentid
        WHERE companyid=${req.user.companyid} GROUP BY date ORDER BY date DESC LIMIT 7`)
            .then( result => {
                res.locals.impressionsData = result;
                res.render('console/')
            } )
            .catch( error=>{
                console.log('Something went wrong when retrieving the console data: '+error)
            } )
    }
};