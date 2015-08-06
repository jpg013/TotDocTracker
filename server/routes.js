/**
 * Created by jgraber on 8/4/15.
 */

var express = require('express');
var apiControllers = require('./controllers/api/index');
var pubControllers = require('./controllers/public/index');

module.exports = function(app) {

  // ==============================
  // public routes ================
  // ==============================
  var publicRouter = express.Router();
  pubControllers(publicRouter);
  app.use(publicRouter);

  // ==============================
  // Api ROUTES ===================
  // ==============================
  var apiRouter = express.Router();
  apiControllers(apiRouter, express);
  app.use(apiRouter);

  // All other routes should redirect to index.html
  app.route('/*')
    .get(function (req, res) {
      res.sendfile('public/index.html');
    });
};

