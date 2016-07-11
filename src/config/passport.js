var passport = require('passport');

module.exports = function(app) {
    // passport mw
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done){
        done(null, user);
    });
    passport.deserializeUser(function(userId, done){
        done(null, userId);
    });

    require('./strategies/local.strategy')();
};