var jwt  = require("jsonwebtoken");
var User = require('./models/user');

module.exports = {
  jwtToken : function(req, res, next) {
    if (typeof req.headers.authorization == "undefined" || req.headers.authorization == null) {
      return next();
    }
    var splitAuth = req.headers.authorization.split(" ");
    if (splitAuth.length != 2) return next();
    var authToken = splitAuth[1];
    if (authToken !== "undefined") {
      // Verify the token
      jwt.verify(authToken, process.env.JTW_TOKEN, function(err, decoded) {
        if (err) {
          return next();
        } else if (typeof decoded == "undefined" || decoded == null) {
          return next();
        } else if (!decoded.user) {
          return next();
        } else {
          User.findOne({username: decoded.user.username, password: decoded.user.password}, function(err, user) {
            if (err) return next(err);
            if (user) {
              req.user = user;
            }
            return next();
          });
        }
      });
    } else {
      return next();
    }
  },
  userLoggedIn: function(req, res, next) {
    var user = req.user;
    if (user) {
      User.findOne({username: user.username, password: user.password}, function (err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.sendStatus(401);
        } else {
          return next();
        }
      });
    } else {
      // if there is no token return an error
      return res.sendStatus(401);
    }
  }
};