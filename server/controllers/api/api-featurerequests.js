// =====================================
// Api FeatureRequests Controller ======
// =====================================

var FeatureRequestsController;
var FeatureRequest  = require('../../models/featurerequest');
var _               = require('underscore');
var auth            = require('../../authentication');

FeatureRequestsController = (function() {
  function FeatureRequestsController(appRouter) {
    var apiPrefix = '/app/api';
    appRouter.route(apiPrefix + '/featurerequests').post(auth.userLoggedIn, this.newFeatureRequest);
  }

  FeatureRequestsController.prototype.newFeatureRequest = function(req, res, next) {
    var userId = req.user._id;
    if (!userId) {
      return res.send(403);
    }

    var data = req.body.featureRequest;
    console.log(data);
    if (typeof data === 'undefined' || data === null) {
      return res.sendStatus(400);
    }

    var feature = new FeatureRequest({
      date: new Date(),
      comments: data.comments,
      userId: userId
    });

    feature.save(function(err) {
      if (err) {
        return next(err);
      }
      return res.json({success: true, msg: "Thanks! Your feature request has been saved."})
    });
  };

  return FeatureRequestsController;
})();

module.exports = function(appRouter) {
  return new FeatureRequestsController(appRouter);
};
