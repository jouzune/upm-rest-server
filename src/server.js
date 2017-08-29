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
var rawParser = bodyParser.raw({
    type: '*/*'
});

var router = express.Router();

router.get(endpoints.DATABASE, auth.authenticate, api.databaseGet);
router.put(endpoints.DATABASE, urlEncodedParser, api.databasePut);
router.post(endpoints.DATABASE, auth.authenticate, rawParser, api.databasePost);
router.delete(endpoints.DATABASE, auth.authenticate, api.databaseDelete);

var app = express();
app.use(endpoints.BASE, router);
app.use(function(req, res, next) {
    res.status(404).send('404: not found');
});
app.listen(3000);