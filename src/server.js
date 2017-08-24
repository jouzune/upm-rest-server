var express = require('express'),
    bodyParser = require('body-parser'),
    bcrypt = require('bcrypt-nodejs'),
    mongoose = require('mongoose'),
    endpoints = require('./endpoints');

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/data');
var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));
mdb.once('open', function (callback) {
});

var db = require('./db')(mongoose),
    auth = require('./auth')(db);

var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var rawParser = bodyParser.raw({extended: false});

var router = express.Router();
router.get(endpoints.UNAUTHORIZED, function(req, res) {
    res.status(401).send('Unauthorized');    
});
router.get(endpoints.USER_NOT_FOUND, function (req, res) {
    res.status(404).send('User not found');
})
router.get(endpoints.MISSING_AUTH, function(req, res) {
    res.status(400).send('No authentication supplied');
})
router.get(endpoints.INVALID_PASSWORD, function(req, res) {
    res.status(400).send('Invalid password');
});
router.get('/auth-test', auth.authenticate, function (req, res) {
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
router.get('/user', auth.authenticate, function(req, res) {
    res.send('GET /user unimplemented');
});

router.post('/push', urlEncodedParser, function(req, res) {
    console.log(req.body);
    res.send(req.body);
});

var app = express();
app.use(endpoints.BASE, router);
app.use(function(req, res, next) {
    res.status(404).send('Page not found');
});
app.listen(3000);