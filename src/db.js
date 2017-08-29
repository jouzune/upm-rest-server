var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

var models;

module.exports = function(mongoose) {
    var userSchema = mongoose.Schema({
        username: String,
        password: String,
        database: Buffer,
    });

    models = {
        Users: mongoose.model('Users', userSchema)
    }
    seedDatabase(models);

    return {
        Users: models.Users,
        register: register,
    };
};

var register = function(data, callback) {
    console.log('Registering user: ', data.username);
    bcrypt.hash(data.password, null, null, function (err, hashedPass) {
        if (err) {
            console.error(err);
            callback(err);
        }
        var user = new models.Users({
            username: data.username,
            password: hashedPass,
        });
        if (data.database) user.database = data.database;

        var userExists = models.Users.findOne({username: user.username})
            .then(function(doc) {
                if (doc) {
                    if (callback) {
                        callback("Username is taken", null);
                    }
                } else {
                    user.save(function (saveErr, user) {
                        if (callback) {
                            if (saveErr) callback(saveErr, null);
                            else callback(null, user);
                        }
                    });
                }
            });

    });
}

function seedDatabase(models) {
    var query = models.Users.findOne({username: 'test'})
        .catch(function(err) {
            console.error(err);
        })
        .then(function(doc) {
            if (doc) {
                return;
            }
            var user = {
                username: 'test',
                password: 'pass'
            }
            register(user);
        });
}