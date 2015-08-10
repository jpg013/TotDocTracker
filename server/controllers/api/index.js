var express = require('express');

module.exports = function(app) {
  var apiRouter = express.Router();

  // Init Controllers
  require('./api-appointments')(apiRouter);
  require('./api-users')(apiRouter);
  require('./api-immunizations')(apiRouter);
  require('./api-changelogs')(apiRouter);
  require('./api-featurerequests')(apiRouter);

  // Tell app to use the apiRouter
  app.use(apiRouter);
};
