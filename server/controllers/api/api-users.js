// =====================================
// API Users Controller ===============
// =====================================

var UsersController;
var User        = require('../../models/user');
var Appointment = require('../../models/appointment');
var Kid         = require('../../models/kid');
var _           = require('underscore');
var auth        = require('../../authentication');

UsersController = (function() {
  function UsersController(appRouter) {
    var apiPrefix = '/app/api';
    appRouter.route(apiPrefix + '/users/context').get(auth.userLoggedIn, this.getContext);
    appRouter.route(apiPrefix + '/users/kids').post(auth.userLoggedIn, this.addKid);
    appRouter.route(apiPrefix + '/users/kids').get(auth.userLoggedIn, this.listKids);
    appRouter.route(apiPrefix + '/users/kids/:id').delete(auth.userLoggedIn, this.removeKid);
    appRouter.route(apiPrefix + '/users/kids/:id/immunization').post(auth.userLoggedIn, this.addImmunization);
  }

  UsersController.prototype.addImmunization = function(req, res, next) {
    var addImmunization = req.body.immunization;
    // Load the user
    User.findById(req.user._id, function(err, user) {
      if (err) {
        return next(err);
      }
      if (typeof user === 'undefined' || user === null) {
        return res.sendStatus(500);
      }
      var kid = _.find(user.kids, function(kid) {
        return (kid._id.toString() === req.params.id);
      });
      if (!kid) {
        return res.sendStatus(500);
      }
      kid.immunizations.push({
        administered: addImmunization.administered,
        id: addImmunization.id
      });
      User.update({_id: req.user._id, kids : {$elemMatch: {_id: kid._id}}}, {$set: {'kids.$': kid.toObject()}}, function(err) {
        if (err) {
          return next(err);
        }
        return res.json({success: true});
      });
    });
  };

  UsersController.prototype.listKids = function(req, res, next) {
    User.findById(req.user._id, function(err, user) {
      if (err) {
        return next(err);
      }
      if (typeof user === 'undefined' || user === null) {
        return res.sendStatus(500);
      }
      var results = {success: true, list: []};
      _.each(user.kids, function(kid) {
        results.list.push({
          firstName: kid.firstName,
          lastName: kid.lastName,
          birthday: kid.birthday,
          gender: kid.gender,
          vaccines: kid.vaccines
        });
      });
      return res.json(results);
    });
  };

  UsersController.prototype.removeKid = function(req, res, next) {
    var id = req.params.id;
    if (!id) {
      return res.sendStatus(400);
    }
    Appointment.find({userId: req.user._id}, {kid:1}, function(err, docs) {
      if (err) {
        return next(err);
      }
      if (typeof docs === 'undefined' || docs === null) {
        return res.sendStatus(500);
      }
      var exists = _.find(docs, function(appointment) {
        return (appointment.kid.id.toString() === id.toString());
      });
      if (exists) {
        return res.json({success: false, msg: "You can't remove kids with existing appointments."});
      } else {
        User.update({_id: req.user._id}, {$pull: {"kids": {_id: id}}}, function(err) {
          if (err) {
            return next(err)
          }
          return res.json({success: true})
        });
      }
    });
  };

  UsersController.prototype.addKid = function(req, res, next) {
    // Get the user
    var data = req.body.kid;
    if (typeof data === "undefined" || data === null) {
      return res.send(400);
    }
    var newKid = new Kid({
      firstName : data.firstName,
      lastName  : data.lastName,
      birthday  : data.birthday,
      gender    : data.gender
    });

    // Query for duplicates
    User.findById(req.user._id, function(err, doc) {
      if (err) {
        return next(err);
      }
      if (!doc) {
        return res.sendStatus(500);
      }
      var exists = _.find(doc.kids, function(oldKid) {
        return (oldKid.firstName == newKid.firstName && oldKid.lastName == newKid.lastName)
      });

      if (exists) {
        return res.json({
          success: false,
          message: "This kid already exists."
        });
      }

      User.update({_id: req.user._id}, {$push: {kids: newKid}}, function(err) {
        if (err) {
          return next(err)
        }
        return res.json({success: true})
      });
    });
  };

  UsersController.prototype.getContext = function(req, res, next) {
    console.log("WHAT THE FUCK!!");
    if (!req.user) {
      return res.status(401).send({
          success: false,
          message: "User context does not exists"
      });
    } else {
        var user = {
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            username: req.user.username,
            id: req.user._id,
            admin: req.user.admin,
            kids: req.user.kids
        };
        return res.json({success: true, user: user})
    }
  };
  return UsersController;
})();

module.exports = function(appRouter) {
  return new UsersController(appRouter);
};
