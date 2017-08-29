var endpoints = require('./endpoints');

var db;
module.exports = function (_db) {
    db = _db;

    return {
        databaseGet: databaseGet,
        databasePut: databasePut,
        databasePost: databasePost,
        databaseDelete: databaseDelete,
    };
};

var databaseGet = function (req, res) {
    var data = {
        username: req.user.username
    };

    db.Users.findOne(data)
        .exec()
        .then(function (user) {
            res.status(200).type('text/plain; charset=us-ascii').send(user.database);
        }, function (reason) {
            res.status(404).send('User not found');
        })
        .catch(function (e) {
            console.error(e);
            res.status(500).send(e);
        });
};

var databasePut = function (req, res) {
    if (!req.body.username) {
        res.status(400).send('Missing username parameter');
    } else if (!req.body.password) {
        res.status(400).send('Missing password parameter');
    } else if (!req.body.database) {
        res.status(400).send('Missing database parameter');
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
                res.status(201).json({
                    username: data.username,
                    database: data.database
                });
            }
        });
    }
};

var databasePost = function (req, res) {
    if (!req.body) {
    // if (!req.body.database) {
        res.status(400).send("Missing body");
    }
    else {
        var data = {
            database: req.body,
            // database: req.body.database,
        };
        db.Users.findOneAndUpdate({ username: req.user.username }, data, { upsert: true })
            .exec()
            .then(function (doc) {
                console.log("POST:\n", doc);
                res.status(201).json({
                    username: doc.username,
                    database: req.body
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