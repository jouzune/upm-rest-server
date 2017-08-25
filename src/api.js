var endpoints = require('./endpoints');

var db;
module.exports = function (_db) {
    db = _db;

    return {
        missingAuth: missingAuth,
        invalidPassword: invalidPassword,
        userNotFound: userNotFound,
        unauthorized: unauthorized,
        databaseGet: databaseGet,
        databasePut: databasePut,
        databasePost: databasePost,
        databaseDelete: databaseDelete,
    };
};

var unauthorized = function (req, res) {
    res.status(401).send('Unauthorized');
};

var userNotFound = function (req, res) {
    res.status(404).send('User not found');
};

var missingAuth = function (req, res) {
    res.status(400).send('No authentication supplied');
};

var invalidPassword = function (req, res) {
    res.status(400).send('Invalid password');
};

var databaseGet = function (req, res) {
    var data = {
        username: req.user.username
    };

    db.Users.findOne(data)
        .exec()
        .then(function (user) {
            res.status(200).send(user.database);
        }, function (reason) {
            res.redirect(endpoints.BASE + endpoints.USER_NOT_FOUND);
        })
        .catch(function (e) {
            console.error(e);
            res.status(500).send(e);
        });
};

var databasePut = function (req, res) {
    if (!req.body.username) {
        res.status(400).send("Missing username parameter");
    } else if (!req.body.password) {
        res.status(400).send("Missing password parameter");
    } else if (!req.body.database) {
        res.status(400).send("Missing database parameter");
    } else {
        var data = {
            username: req.body.username,
            password: req.body.password,
            database: req.body.database,
        };

        db.register(data, function(err, user) {
            if (err) {
                console.error(err);
                res.status(500).send(err);
            } else {
                res.status(201).send({
                    username: data.username,
                    database: data.database
                });
            }
        });
    }
};

var databasePost = function (req, res) {
    if (!req.body.database) {
        res.status(400).send("Missing database parameter");
    }
    else {
        var data = {
            // username: req.user.username,
            // password: req.user.password,
            database: req.body.database
        };
        db.Users.findOneAndUpdate({ username: req.user.username }, data, { upsert: true })
            .exec()
            .then(function (doc) {
                console.log("POST:\n", doc);
                res.status(201).json({
                    username: doc.username,
                    database: doc.database
                });
            }, function(err) {
                console.error(err);
                res.status(500).send(err);
            })
            .catch(function (e) {
                console.error(e);
                res.status(500).send(e);
            });

    }
};

var databaseDelete = function (req, res) {
    var data = {
        username: req.user.username
    };
    db.Users.findOneAndRemove(data)
        .exec()
        .then(function (doc) {
            console.log("DELETE:\n", doc);
            res.status(200).json(doc);
        })
        .catch(function (e) {
            console.error(e);
            res.status(500).send(e);
        });
};