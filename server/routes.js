/**
 * Created by jgraber on 8/4/15.
 */

var express = require('express');
var apiControllers = require('./controllers/api/index');
var publicControllers = require('./controllers/public/index');

module.exports = function(app) {

  // ==============================
  // PUBLIC ROUTES ================
  // ==============================
  publicControllers(app);

  // ==============================
  // API ROUTES ===================
  // ==============================
  apiControllers(app);

  // ==============================
  // All other routes should
  // redirect to index.html
  // ==============================
  app.route('/*')
    .get(function (req, res) {
      res.sendfile('public/index.html');
    });
};

