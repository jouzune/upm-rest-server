var express = require('express'),
    bodyParser = require('body-parser'),
    bcrypt = require('bcrypt-nodejs'),
    passport = require('passport'),
    PassportStrategy = require('passport-http').BasicStrategy,
    mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/data');
var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));
mdb.once('open', function (callback) {
});

var db = require('./db')(mongoose);

passport.use(new PassportStrategy(
    function(username, password, cb) {
        var findUser = db.Users.findOne({username: username})
        .catch(function (err) {
            console.error('Find user error:', err);
            return cb(err);
        })
        .then(function (doc) {
            if (doc) {
                console.log('Found user:', doc.username);
                console.log('Comparing password: %s with hash: %s', password, doc.password);
                var isValidPassword = bcrypt.compareSync(password, doc.password);
                console.log('  Valid password:', isValidPassword);
                return isValidPassword ? cb(null, doc) : cb("Invalid password", false);
            } else {
                cb(null, false);
            }
        });
    })
);

var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var rawParser = bodyParser.raw({extended: false});

var router = express.Router();
router.get('/unauthorized', function(req, res) {
    res.status(401).send('Unauthorized');    
});
router.get('/usernotfound', function (req, res) {
    res.status(404).send('User not found');
})
router.get('/missingauth', function(req, res) {
    res.status(400).send('No authentication supplied');
})
router.get('/invalidpassword', function(req, res) {
    res.status(400).send('Invalid password');
});
router.get('/authtest', db.authenticate, function (req, res) {
    res.json(req.user);
});
router.post('/user', urlEncodedParser, function(req, res) {
    var errors = [];
    var badRequest = false;
    
    if (!req.body.username) {
        res.status(400).send("No username specified");
    }
    else if (!req.body.password) {
        res.status(400).send("No password specified");
    }
    else {
        db.register({
            username: req.body.username,
            password: req.body.password,
        }, function(err, user) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(user);
            }
        });
    }
});
router.get('/user/database', db.authenticate, function(req, res) {
    res.send('/user/database not-yet');
});

router.post('/push', urlEncodedParser, function(req, res) {
    console.log(req.body);
    res.send(req.body);
});

var app = express();
app.use('/api', router);
app.use(function(req, res, next) {
    res.status(404).send('Page not found');
});
app.listen(3000);