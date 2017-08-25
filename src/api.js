var endpoints = require('./endpoints');

var db;
module.exports = function(_db) {
    db = _db;

    return {
        missingAuth: missingAuth,
        invalidPassword: invalidPassword,
        userNotFound: userNotFound,
        unauthorized: unauthorized,
        database: database,
        databasePost: databasePost,
        databaseDelete: databaseDelete,
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

    db.Users.findOne(data)
    .exec()
    .then(function(user) {
        res.status(200).send(user.database);
    }, function(reason) {
        res.redirect(endpoints.BASE + endpoints.USER_NOT_FOUND);
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
            database: req.body.database
        };
        db.Users.findOneAndUpdate({username: data.username}, data, {upsert: true})
        .exec()
        .then(function(doc) {
            console.log("UPSERTED:\n", doc);
            res.status(201).json(doc);
        })
        .catch(function(e) {
            console.error(e);
            res.status(500).send(e);
        });
        
    }
};

var databaseDelete = function(req, res) {
    var data = {
        username: req.user.username
    };
    db.Users.findOneAndRemove(data)
    .exec()
    .then(function(doc) {
        console.log("DELETED:\n", doc);
        res.status(200).json(doc);
    })
    .catch(function(e) {
        console.error(e);
        res.status(500).send(e);
    });
};