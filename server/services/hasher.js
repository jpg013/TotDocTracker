var bcrypt = require("bcrypt");

module.exports.hash = function(word, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(word, salt, function(err, hash) {
            return callback(err, hash);
        })
    });
};

module.exports.compare = function(word, hash, callback) {
    bcrypt.compare(word, hash, function(err, resp) {
        return callback(err, resp);
    });
};