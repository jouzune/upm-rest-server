var endpoints = require('./endpoints');

var db;
module.exports = function(_db) {
    db = _db;

    return {
        unauthorized: unauthorized,
        missingAuth: missingAuth,
        invalidPassword: invalidPassword,
        database: database,
        databasePost: databasePost
    };
};

var unauthorized = function(req, res) {
    res.status(401).send('Unauthorized');    
};

var userNotFound = function(req, res) {
    res.status(404).send('User not found');
};

var missingAuth = function(req, res) {
    res.status(400).send('No authentication supplied');
};

var invalidPassword = function(req, res) {
    res.status(400).send('Invalid password');
};

var database = function(req, res) {
    res.send('GET /user unimplemented');
};

var databasePost = function(req, res) {
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
};