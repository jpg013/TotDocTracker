var User     = require('../../models/user');
var jwt      = require("jsonwebtoken");
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
var crypto   = require('crypto');
var moment   = require('moment');
var path     = require('path');
var express  = require('express');

module.exports = function(app) {
  publicRouter = express.Router();

  publicRouter.route('/recover')
    .post(function(req, res, next) {
      var pass = req.body.pass;
      var passRepeat = req.body.passRepeat;
      var code = req.body.code;
      if (!pass || !passRepeat || !code) {
        return res.sendStatus(400);
      }
      if (pass !== passRepeat) {
        return res.sendStatus(400);
      }
      User.findOne({'recover.code': code}, function (err, user) {
        if (err) {
          return res.sendStatus(500);
        }
        if (!user) {
          return res.sendStatus(500);
        }
        user.hashPassword(pass, function (err, hash) {
          if (err) {
            return res.sendStatus(500);
          }
          User.update({_id: user._id}, {$set: {password: hash}, $unset: {recover: ""}}, function(err) {
            if (err) {
              return res.sendStatus(500);
            }
            return res.sendStatus(200);
          });
        })
      })
    })
    .get(function(req, res, next) {
      var code = req.query.code;
      if (!code) {
        return res.sendFile(path.join(__dirname, app.get('client'), '/tpls', 'password-recover-error.html'));
      }
      User.findOne({'recover.code': code}, function(err, doc) {
        if (err) {
          return res.sendFile(path.join(__dirname, app.get('client'), '/tpls', 'password-recover-error.html'));
        }
        if (!doc) {
          return res.sendFile(path.join(__dirname, app.get('client'), '/tpls', 'password-recover-error.html'));
        }
        if (moment.utc().isAfter(moment.utc(doc.recover.expires), 'days')) {
          return res.sendFile(path.join(__dirname, app.get('client'), '/tpls', 'password-recover-expired.html'));
        }
        // If everything checks out, just call next().
        next();
      });
    });
  publicRouter.route('/signin_help')
    .post(function(req, res, next) {
      User.findOne({email: req.body.email}, function(err, doc) {
        if (err) {
          return next(err);
        }
        if (!doc) {
          // There is a slight security flaw here where users can find out whether
          // an email address is enrolled based on the return of this message.
          return res.json({success: false, msg: "Couldn't find that email in our system."});
        }
        crypto.randomBytes(50, function(err, buffer) {
          if (err) {
            return res.json({success: false, msg: "There was an error retrieving your password."});
          }
          // Update the user recover
          var recover = {
            code: buffer.toString('base64'),
            expires: moment().utc().add(1, 'day')
          };
          User.update({_id: doc._id}, {$set: {'recover' : recover}}, function(err) {
            if (err) {
              return res.json({success: false, msg: "There was an error retrieving your password."});
            } else {
              var link = "http://localhost:3030/recover?code="+encodeURIComponent(buffer.toString('base64'));
            var email = new sendgrid.Email({
                to:       doc.email,
                from:     'admin@TotDocTracker.com',
                subject:  'Password Recovery',
                html:     'Hello, you are receiving this email because you requested that your password be reset. Click on the following link to reset your password <a href='+link+'>Click here</a>.'
              });
              sendgrid.send(email, function(err, json) {
                if (err) {
                  return res.json({success: false, msg: "There was an error retrieving your password."});
                }
                res.json({
                  success: true,
                  msg: "An email has been sent with details to change your password."
                });
              });
            }
          });
        });
      });
    });
  publicRouter.route('/register')
    .post(function(req, res, next) {
      // Query to see if email already exists in our database
      User.findOne({"email": req.body.email}, function(err, doc) {
        if (err) {
          return next(err);
        }
        if (typeof doc !== 'undefined' && doc !== null) {
          return res.json({
            success: "false",
            msg: "A user with that email already exits."
          });
        } else {
            var user = new User({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email
            });
            user.hashPassword(req.body.password, function (err, hash) {
              if (err) {
                return next(err);
              } else {
                user.password = hash;
                user.save(function (err) {
                  if (err) {
                    return next(err)
                  }
                  var token = jwt.sign({user: user.toObject()}, process.env.JTW_TOKEN, {
                    expiresInMinutes: 1440 // Expires in 24 hours
                  });
                  res.json({
                    success: true,
                    msg: "Successful registration.",
                    token: token
                  });
                });
              }
            });
          }
      });
    });

  publicRouter.route('/login')
    .post(function(req, res, next) {
      // Find the user
      User.findOne({email: req.body.email}, function(err, user) {
          if (err) return next(err);
          if (!user) {
              return res.json({ success: false, msg: "Oops. Your login failed." });
          } else if (user) {
            // Check the password
            user.comparePassword(req.body.password, function(err, resp) {
              if (err) { return next(err); }
              else if (resp == false) {
                return res.json({ success: false, msg: "Oops. Your login failed." });
              } else {
                  // Create a token
                var token = jwt.sign({user: user.toObject()}, process.env.JTW_TOKEN, {
                  expiresInMinutes: 1440 // Expires in 24 hours
                });
                res.json({
                  success: true,
                  msg: "Successful login.",
                  token: token
                });
              }
            });
          }
      });
    });
  // Tell the app to use the router.
  app.use(publicRouter)
};
