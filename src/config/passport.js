var passport = require('passport');

module.exports = function(app) {
    // passport mw
    app.use(passport.initialize());
    app.use(passport.session());

    // This is called after req.login to store data to the session
    passport.serializeUser(function(user, done){
        done(null, user);
    });

    // This is called when req.user is invoked
    passport.deserializeUser(function(userId, done){
        done(null, userId);
    });


    require('./strategies/local.strategy')();
};