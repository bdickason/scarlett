/* index.js - Start up the server */

var cfg = require('./cfg/config.js');

var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var MailListener = require('mail-listener2');

module.exports.startServer = function() {
  app = express();

  // configure middleware
  app.use(bodyParser());  // Parses json
  app.use(favicon(__dirname + '/public/images/favicon.ico'));


  /* Basic funk-tionality */
  var mailListener = new MailListener({
    username: cfg.MAIL_USERNAME,
    password: cfg.MAIL_PASSWORD,
    host: cfg.MAIL_HOST,
    port: cfg.MAIL_PORT,
    markSeen: false,            // Do not mark e-mail as read (yet!)
    fetchUnreadOnStart: false,  // Do not grab all e-mail at once, only new stuff.
    attachments: false          // Do not grab attachments (yet!)
  });

  console.log(mailListener);
  mailListener.start();

  mailListener.on('server:connected', function() {
    console.log('imap Connected');
  });

  mailListener.on("server:disconnected", function(){
    console.log("imap Disconnected");
  });

  mailListener.on("error", function(err){
    console.log(err);
  });

  mailListener.on("mail", function(mail, seqno, attributes){
    // do something with mail object including attachments
    console.log("emailParsed", mail);
    // mail processing code goes here
  });

  mailListener.on("attachment", function(attachment){
    console.log('wtf, an attachment?!');
    console.log(attachment.path);
  });

  /* API Routes */
  app.get('*', function(req, res) {
    res.send('success');
  });
}
