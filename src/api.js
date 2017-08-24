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
    var data = {
        username: req.user.username
    }

    db.User.findOne(data)
    .exec()
    .then(function(user) {
        res.status(200).send(user.database);
    }, function(reason) {
        res.status(404).send(reason);
    })
    .catch(function(e) {
        console.error(e);
        res.status(500).send(e);
    });
};

var databasePost = function(req, res) {
    if (!req.body.database) {
        res.status(400).send("Missing database parameter");
    }
    else {
        var data = {
            username: req.user.username,
            password: req.user.password,
            database: req.database
        }
        db.Users.findOneAndUpdate({username: data.username}, data, {upsert: true})
        .exec()
        .then(function(doc) {
            res.status(201);
        })
        .catch(function(e) {
            console.error(e);
            res.status(500).send(e);
        });
        
    }
};