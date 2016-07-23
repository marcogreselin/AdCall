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
    postSetup: function (req, res) {
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
    },
    /**
     * This mw is used to display the campaigns of a given company.
     * @param req
     * @param res
     */
    getCampaigns: function  (req, res) {
        db.any(`SELECT * FROM campaign WHERE agentid = ${req.user.agentid};`)
            .then(function(data) {
                res.locals.rows = data;
                res.render('console/campaigns');
            })
            .catch(function(err){
                console.log(err.toString());
            })
    }

};