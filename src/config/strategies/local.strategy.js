var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var pg = require('pg');

module.exports = function(){
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
        function(email, password, done){
            pg.defaults.ssl = true;
            pg.connect(process.env.DATABASE_URL || `postgres://ugeiskcgfndzuy:2mReS0WnS_ob7pWjEkndIyrPDl@ec2-54-247-185-241.`+
                `eu-west-1.compute.amazonaws.com:5432/ddm2it63dsusa`, function(err, client) {
                if (err){
                    console.log('Connection issue when logging in: ' + JSON.stringify(err));
                    done('Error with database,', null);
                } else {
                    client
                        .query(`SELECT * FROM agent WHERE email='${email}'`, function(err, result) {
                            if(err || result.rows.length === 0 ) {
                                console.log('Query issue when loggin in: '+ JSON.stringify(err));
                                done(null, false);
                            } else {
                                var user = result;
                                console.log('ready to log user in');
                                done(null, user);
                            }
                        });
                }
            });
        }
    ));
};