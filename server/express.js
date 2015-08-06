var auth           = require('./authentication');
var express        = require('express');
var bodyParser     = require('body-parser');
var morgan         = require('morgan');
var cookieParser   = require('cookie-parser');
var path           = require('path');

module.exports = function(app) {
  app.use(morgan('dev')); // log every request to the console
  app.use(bodyParser.json({extended: true})); // get information from html forms
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, '../', '/public')));
  app.use(express.static(path.join(__dirname, '../', '/client/tpls')));
  app.use(auth.jwtToken);
};