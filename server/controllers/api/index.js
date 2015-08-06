module.exports = function(apiRouter) {
  // Init Controllers
  this.appointmentsController     = require('./api-appointments')(apiRouter);
  this.usersController            = require('./api-users')(apiRouter);
  this.immunizaitonsController    = require('./api-immunizations')(apiRouter);
  this.changelogController        = require('./api-changelogs')(apiRouter);
  this.featureRequestsController  = require('./api-featurerequests')(apiRouter);
};
