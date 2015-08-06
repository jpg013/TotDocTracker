var mongoose  = require("mongoose");
var hasher    = require('../services/hasher');
var kidSchema = require('./kid').Schema;

// Schema ----------------------------------------------------------------------
var UserSchema = new mongoose.Schema ({
    email     :          {type: String},
    password  :          {type: String},
    firstName :          {type: String},
    lastName  :          {type: String},
    admin     :          {type: Boolean, default: false},
    appointmentCounter : {type: Number, default: 0},
    created   :          {type: Date},
    kids      :          [kidSchema],
    recover   : {
      code : {type: String},
      expires : {type: Date}
    }
});

// Methods ---------------------------------------------------------------------

UserSchema.methods.hashPassword = function(password, cb) {
    hasher.hash(password, function(err, hash) {
        return cb(err, hash);
    });
};

UserSchema.methods.comparePassword = function(word, cb) {
    hasher.compare(word, this.password, cb)
};

// Exports ---------------------------------------------------------------------
module.exports = mongoose.model('User', UserSchema);
