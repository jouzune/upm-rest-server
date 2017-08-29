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
        console.log('Basic Authentication(' + username + ":" + password + ")")    
        var findUser = db.Users.findOne({username: username})
        .catch(function (err) {
            console.error('  Find user error:', err);
            return cb(err);
        })
        .then(function (doc) {
            if (doc) {
                console.log('  Found user:', doc.username);
                // console.log('  Comparing password: %s with hash: %s', password, doc.password);
                var isValidPassword = bcrypt.compareSync(password, doc.password);
                console.log('  Valid password:', isValidPassword);
                return isValidPassword ? cb(null, doc) : cb("Invalid password", false);
            } else {
                cb(null, false);
            }
        });
    })
);

var authenticate = function(req, res, next) {
    passport.authenticate('basic', function (err, user, info) {
        if (err) console.error('  ', err);
        if (info) console.log('  info: ', info);
        if (err) return res.status(400).send("Invalid password");
        else if (!user) return res.status(404).send("User not found");
        req.user = user;
        return next();
    })(req, res, next);
}