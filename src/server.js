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
    auth = require('./auth')(db),
    api = require('./api')(db);

var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var rawParser = bodyParser.raw();

var router = express.Router();
router.get(endpoints.UNAUTHORIZED, api.unauthorized);
router.get(endpoints.MISSING_AUTH, api.missingAuth);
router.get(endpoints.INVALID_PASSWORD, api.invalidPassword);
router.get(endpoints.USER_NOT_FOUND, api.userNotFound);

router.get(endpoints.DATABASE, auth.authenticate, api.databaseGet);
router.put(endpoints.DATABASE, urlEncodedParser, api.databasePut);
router.post(endpoints.DATABASE, auth.authenticate, urlEncodedParser, api.databasePost);
router.delete(endpoints.DATABASE, auth.authenticate, api.databaseDelete);

router.get('/auth-test', auth.authenticate, function (req, res) {
    res.json(req.user);
});
router.post('/blob-test', urlEncodedParser, function(req, res) {
    console.log(req.body);
    res.send(req.body);
});

var app = express();
app.use(endpoints.BASE, router);
app.use(function(req, res, next) {
    res.status(404).send('404: not found');
});
app.listen(3000);