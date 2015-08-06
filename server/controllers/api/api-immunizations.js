// =====================================
// API Immunizations ===================
// =====================================
var ImmunizationsController;
var Immunization = require('../../models/immunization');
var Appointment  = require('../../models/appointment');
var _            = require('underscore');
var moment       = require('moment');
var auth         = require('../../authentication');

ImmunizationsController = (function() {
  function ImmunizationsController(appRouter) {
    var apiPrefix = '/app/api';
    appRouter.route(apiPrefix + '/immunizations').get(auth.userLoggedIn, this.list);
    appRouter.route(apiPrefix + '/immunizations').post(auth.userLoggedIn, this.new);
    appRouter.route(apiPrefix + '/immunizations/kid/:kidId').get(auth.userLoggedIn, this.getImmunizationsForKid);
  }

  ImmunizationsController.prototype.getImmunizationsForKid = function(req, res, next) {
    var kidId = req.params.kidId;
    if (!kidId) {
      return res.send(400);
    }

    Appointment.find({'kid.id': kidId}, function(err, docs) {
      if (err) {
        return next(err);
      }
      if (typeof docs === 'undefined' || docs === null) {
        return res.send(500);
      }
      var results = {
        list: []
      };
      _.each(docs, function(doc) {
        _.each(doc.immunizations, function(immunization) {
          // If already, use the latest date
          var exists = false;
          _.each(results.list, function(result) {
            if (result.id.toString() === immunization.toString()) {
              if (moment.utc(doc.date).isAfter(result.date, 'day')) {
                result.date = doc.date;
                exists = true;
              }
            }
          });
          if (!exists) {
            results.list.push({id: immunization, date: doc.date});
          }
        });
      });
      return res.json(results);
    })
  };

  ImmunizationsController.prototype.new = function(req, res, next) {
    if (!req.user.admin) {
      return res.sendStatus(403);
    }

    var data = req.body.immunizationData;
    if (typeof data === "undefined" || data === null) {
      return res.send(400);
    }

    var immunization = new Immunization({
      name: data.name,
      description: data.description
    });

    immunization.save(function(err) {
      if (err) {
        return next(err);
      }
      res.sendStatus(200);
    })
  };

  ImmunizationsController.prototype.list = function(req, res, next) {
    Immunization.find({}, function (err, docs) {
      if (err) {
        return next(err);
      }
      results = {
        success: true,
        list: []
      };
      _.each(docs, function (doc) {
        results.list.push({name: doc.name, description: doc.description, _id: doc._id});
      });
      return res.json(results);
    });
  };
  return ImmunizationsController;
})();

module.exports = function(appRouter) {
  return new ImmunizationsController(appRouter);
};
