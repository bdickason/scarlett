/* index.js - Start up the server */

var cfg = require('./cfg/config.js');

// Express and middleware
var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

// External Dependencies
var MailListener = require('mail-listener2');

// My modules
var Gmail = require('gmail-imap');  // OAuth current user w/ google and connect their gmail



module.exports.startServer = function() {
  app = express();

  // configure middleware
  app.use(bodyParser());  // Parses json
  app.use(favicon(__dirname + '/public/images/favicon.ico'));


  /* Basic funk-tionality */
  var gmail = new Gmail(cfg);
 
  /* API Routes */
  app.get('/', function(req, res) {

    // Get gmail's authentication URL
    var authUrl = gmail.getAuthUrl();
    res.redirect(authUrl);
  });

  app.get('/callback', function(req, res) {
    var code = req.query.code;

    gmail.getAccessToken(code, function(callback) {
      if(callback.refresh_token && callback.access_token) {
        res.send('success!');
      }
      else {
        gmail.getEmail(callback.access_token, function(data) {
          var email = data.emails[0].value;
          res.redirect('/mail?access_token=' + callback.access_token + '&email=' + email);
        });
      }
    });
  });

  app.get('/mail', function(req, res) {
    // Monitors your mailbox for new mail to come in
    
    var email = req.query.email;
    var access_token = req.query.access_token;

    // Mail server //
    var xoauth2 = gmail.getXOauth2(email, access_token);

    var mailListener = new MailListener({
      xoauth2: xoauth2,
      host: cfg.MAIL_HOST,
      port: cfg.MAIL_PORT,
      tls: true,
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
      res.json(mail);
    });

    mailListener.on("attachment", function(attachment){
      console.log('wtf, an attachment?!');
      console.log(attachment.path);
    });

  });

  app.listen(cfg.PORT);

};

