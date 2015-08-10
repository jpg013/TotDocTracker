// =====================================
// API Appointments ====================
// =====================================
var AppointmentsController;
var Appointment  = require('../../models/appointment');
var Immunization = require('../../models/immunization');
var User         = require('../../models/user');
var _            = require('underscore');
var auth         = require('../../authentication');

AppointmentsController = (function() {
  function AppointmentsController(appRouter) {
    var apiPrefix = '/app/api';
    appRouter.route(apiPrefix + '/appointments/new').post(auth.userLoggedIn, this.newAppointment);
    appRouter.route(apiPrefix + '/appointments/update/:appointmentId').put(auth.userLoggedIn, this.update);
    appRouter.route(apiPrefix + '/appointments/list').get(auth.userLoggedIn, this.list);
    appRouter.route(apiPrefix + '/appointments/:appointmentId').get(auth.userLoggedIn, this.detail);
    appRouter.route(apiPrefix + '/appointments/:appointmentId').delete(auth.userLoggedIn, this.deleteAppointment);
  }

  AppointmentsController.prototype.deleteAppointment = function(req, res, next) {
    var appointmentId = req.params.appointmentId;
    Appointment.findOne({_id: appointmentId}, function(err, doc) {
      if (err) {
        return next(err);
      }
      if (typeof doc === "undefined" || doc === null) {
        return res.sendStatus(500);
      }
      Appointment.remove({_id: doc._id}, function(err) {
        if (err) {
          return next(err);
        }
        return res.sendStatus(200);
      });
    });
  };

  AppointmentsController.prototype.update = function(req, res, next) {
    var appointmentId = req.params.appointmentId;
    var data = req.body.appointmentData;
    if (!appointmentId) {
      return res.send(400);
    }
    if (typeof data === "undefined" || data === null) {
      return res.send(400);
    }
    Appointment.findOne({_id: appointmentId}, function(err, doc) {
      if (err) {
        return next(err);
      }
      if (typeof doc === "undefined" || doc === null) {
        return res.send(500);
      }

      doc.date = data.date;
      doc.reason = data.reason;
      doc.location = data.location;
      doc.immunizations = data.immunizations;
      doc.height = data.height;
      doc.weight = data.weight;
      doc.notes = data.notes;
      doc.kid = {
        firstName: data.kid.firstName,
        lastName: data.kid.lastName,
        _id: data.kid._id
      };
      doc.save(function(err) {
        if (err) {
          return next(err);
        }
        return res.json({success: true})
      });
    });
  };

  AppointmentsController.prototype.newAppointment = function(req, res, next) {
    // Create and save new appointment
    var data = req.body.appointmentData;
    if (typeof data === "undefined" || data === null) {
      return res.send(400);
    }

    var appointment = new Appointment({
      date : data.date,
      reason: data.reason,
      location: data.location,
      weight: data.weight,
      height: data.height,
      notes: data.notes,
      immunizations: data.immunizations,
      userId: req.user._id,
      createdDate: new Date(),
      kid: {
        firstName: data.kid.firstName,
        lastName: data.kid.lastName,
        id: data.kid._id
      }
    });

    appointment.save(function(err) {
      if (err) {
        next(err);
      }
      return res.json({success: true, msg: "Appointment Saved"});
    });
  };

  AppointmentsController.prototype.detail = function(req, res, next) {
    var appointmentId = req.params.appointmentId;
    if (!appointmentId) {
      return res.send(403);
    }
    Appointment.findOne({_id: appointmentId}).populate('immunizations').exec(function(err, doc) {
      if (err) {
        return next(err);
      }
      var result = {success: true, appointment: {}};
      if (typeof doc !== "undefined" || doc !== null) {
        result.appointment.date = doc.date;
        result.appointment.reason = doc.reason;
        result.appointment.location = doc.reason;
        result.appointment.immunizations = doc.immunizations;
        result.appointment.height = doc.height;
        result.appointment.weight = doc.weight;
        result.appointment.notes = doc.notes;
        result.appointment.kid = doc.kid;
      }
      res.json(result);
    });
  };

  AppointmentsController.prototype.list = function(req, res, next) {
    var userId = req.user._id;
    if (!userId) {
      return res.send(403);
    }
    var sort = {date: -1};

    // Pagination logic
    var page = req.query.page;
    if (isNaN(page) || page === 0) {
      page = 1;
    }
    var limit = req.query.limit;
    if (isNaN(limit) || limit === 0) {
      limit = 20; // Default to 20 for now. This is arbitrary.
    }
    if (page > 1) {
      var skip = (page - 1) * (limit); // Have to subtract 1 from page because it starts at 1 instead of 0.
    } else {
      var skip = 0
    }
    Appointment.find({userId: userId})
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .exec(function(err, docs) {
      if (err) {
        return next(err);
      }
      var results = {success: true, list: []};
      _.each(docs, function(item) {
        var result = {
          formattedDate: item.formattedDate,
          reason: item.reason,
          location: item.location,
          kid: item.kid,
          _id: item._id
        };
        results.list.push(result);
      });
      results['hasResults'] = (results.list.length > 0);
      res.json(results);
    })
  };

  return AppointmentsController;
})();

module.exports = function(appRouter) {
  return new AppointmentsController(appRouter);
};
