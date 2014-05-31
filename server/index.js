/* index.js - Start up the server */

var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var Gmail = require('gmail');

module.exports.startServer = function() {
  app = express();

  // configure middleware
  app.use(bodyParser());  // Parses json
  app.use(favicon(__dirname + '/public/images/favicon.ico'));

  app.get('*', function(req, res) {
    res.send('success');
  });
}
