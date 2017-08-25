var passport = require('passport'),
    PassportStrategy = require('passport-http').BasicStrategy,
    bcrypt = require('bcrypt-nodejs'),
    endpoints = require('./endpoints');

var db;
module.exports = function(_db) {
    db = _db;

    return {
        authenticate: authenticate
    };
};

passport.use(new PassportStrategy(
    function(username, password, cb) {
        var findUser = db.Users.findOne({username: username})
        .catch(function (err) {
            console.error('  Find user error:', err);
            return cb(err);
        })
        .then(function (doc) {
            if (doc) {
                console.log('  Found user:', doc.username);
                console.log('  Comparing password: %s with hash: %s', password, doc.password);
                var isValidPassword = bcrypt.compareSync(password, doc.password);
                console.log('  Valid password:', isValidPassword);
                return isValidPassword ? cb(null, doc) : cb("Invalid password", false);
            } else {
                // res.redirect(endpoints.BASE + endpoints.USER_NOT_FOUND);
                cb(null, false);
            }
        });
    })
);

var authenticate = function(req, res, next) {
    console.log('Basic Authentication')
    passport.authenticate('basic', function (err, user, info) {
        console.log('  user: ', user);
        console.log('  err: ', err);
        console.log('  info: ', info);
        if (err) return res.redirect(endpoints.BASE + endpoints.INVALID_PASSWORD);
        else if (!user) return res.redirect(endpoints.BASE + endpoints.USER_NOT_FOUND);
        req.user = user;
        return next();
    })(req, res, next);
}