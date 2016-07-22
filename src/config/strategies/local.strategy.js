var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var pg = require('pg');
var bcrypt = require('bcrypt');

module.exports = function(){
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
        function(email, password, done){
            pg.defaults.ssl = true;
            pg.connect(`postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
                `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
                if (err){
                    console.log('Connection issue when logging in: ' + JSON.stringify(err));
                    return done(err);
                } else {
                    client.query(`SELECT agentid, agent.companyid, companytype, admin, email, firstname, lastname, password, verified 
                    FROM agent LEFT JOIN company ON agent.companyid = company.companyid
                    WHERE email='${email}'`, function(err, result) {
                        if(err || result.rows.length === 0 ) {
                            console.log('Query issue when loggin in: '+ JSON.stringify(err));
                            return done(null, false, {message: 'Check back your username and password.'});
                        }

                        var user = result;
                        const hashedPassword = user.rows[0].password;
                        const plainTextPassword = password;

                        bcrypt.compare(plainTextPassword, hashedPassword, function(err, res) {
                             if(err || res != true){
                                 return done(null, false, {message: 'Check back your username and password.', email: email});
                             }
                            console.log('ready to log user in ' + JSON.stringify(user));
                            return done(null, user);
                        });

                    });
                }
            });
        }
    ));

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback : true
        },
        function(req, email, password, done){
            pg.defaults.ssl = true;
            pg.connect(process.env.DATABASE_URL || `postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
                `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusah`, function(err, client) {
                if (err){
                    console.log("Error reaching DB when creating account " + err['detail']);
                    done(err);
                } else {
                    const saltRounds = 10;
                    const plaintextPassword = req.body.password;
                    // Hash the password
                    bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
                        if (err){
                            console.log("Error when hashing password during registration. " + err);
                            return done(err);
                        } else {
                            client.query(`INSERT INTO agent (admin, email, password, firstname, lastname)
                            VALUES (false, '${req.body.email}', '${hash}', '${req.body.firstname}', '${req.body.lastname}');
                            SELECT * FROM agent WHERE email = '${req.body.email}'`, function(err, result) {
                                if(err) {
                                    if (err.constraint) {
                                        console.log(err);
                                        return done(err);
                                    } else {
                                        console.log(err);
                                        return done(err);
                                    }
                                } else {
                                    // If the user is created correctly we will log her in using passport.
                                    // Not needed when logging in.
                                    return done(null, result);
                                }
                            });
                        }
                    });
                }
            });
        }
    ));
};