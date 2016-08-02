var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var queries = require('../../db/queries');


module.exports = function(){
    /**
     * Defines local-login which is used in Passport. Uses bycrypt for the hashing.
     * @see passport
     * @see queries
     */
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function(email, password, done){
            queries.passportLogin(email)
                .then((result) => {
                    const hashedPassword = result.password;
                    const plainTextPassword = password;

                    bcrypt.compare(plainTextPassword, hashedPassword, function(err, res) {
                        if(err || res != true){
                            return done(null, false, {
                                message: 'Check back your username and password.'
                            });
                        }
                        console.log('Ready to log in agent ' + JSON.stringify(result.email));
                        console.log(JSON.stringify(result))
                        return done(null, result);
                    });
                })
                .catch((error) => {
                    console.log(`Error when logging in user ${email} (multiple/none with this email): `+ error);
                    return done(null, false, {message: 'Email or password wrong!'});
                })

    }));
    /**
     * Defines local-signup which is used in Passport. Uses bycrypt for the hashing.
     * @see passport
     * @see queries
     */
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback : true
        }, function(req, email, password, done){
            const saltRounds = 10;
            const plaintextPassword = req.body.password;
            // Password Hashing
            bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
                if (err){
                    console.log("Error when hashing password during registration. " + err);
                    return done(err);
                } else {
                    var userData = {
                        email: req.body.email,
                        hashedPassword: hash,
                        firstName: req.body.firstname,
                        lastName: req.body.firstname
                    };
                    queries.passportSignUp(userData)
                        .then( (result)=>{
                            return done(null, result);
                        } )
                        .catch( (error)=>{
                            console.log(`Error when signing up user ${userData.email}: `+JSON.stringify(error));
                            // In case of Email already registered.
                            if (error.constraint) {
                                return done(null, false, {message: 'This email address is already registered with us.'});
                            } else {
                                // Other errors.
                                return done(error);
                            }
                        } )
                }
            })
        }
    ));
};