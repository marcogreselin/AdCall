var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;





module.exports = function(){
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
        function(username, password, done){

            var user = {
                username: email,
                password: password
            };
            // once I have the user from the DB I call the callback
            done(null, user);
        }
    ));
};