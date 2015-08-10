// =====================================
// Api Changelog Controller ============
// =====================================

var ChangelogController;
var Changelog        = require('../../models/changelog');
var _                = require('underscore');
var auth             = require('../../authentication');

ChangelogController = (function() {
  function ChangelogController(appRouter) {
    var apiPrefix = '/app/api';
    appRouter.route(apiPrefix + '/changelogs').post(auth.userLoggedIn, this.newChangeLog);
    appRouter.route(apiPrefix + '/changelogs/list').get(auth.userLoggedIn, this.list);
  }

  ChangelogController.prototype.list = function(req, res, next) {
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
    Changelog.find()
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
          title: item.title,
          date: item.date,
          formattedDate: item.formattedDate,
          notes: item.notes,
          _id: item._id
        };
        results.list.push(result);
      });
      results['hasResults'] = (results.list.length > 0);
      res.json(results);
    })
  };

  ChangelogController.prototype.newChangeLog = function(req, res, next) {
    if (req.user.admin !== true) {
      res.sendStatus(403);
    }
    var data = req.body.changelog;
    if (typeof data === 'undefined' || data === null) {
      return res.sendStatus(400);
    }

    var changeLog = new Changelog({
      title: data.title,
      date: data.date,
      notes: data.notes
    });
    changeLog.save(function(err) {
      if (err) {
        return next(err);
      }
      return res.json({success: true, msg: "Changelog saved."})
    })
  };

  return ChangelogController;
})();

module.exports = function(appRouter) {
  return new ChangelogController(appRouter);
};
