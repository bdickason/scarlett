/* index.js - Start up the server */

var cfg = require('./cfg/config.js');

var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var MailListener = require('mail-listener2');
var xoauth2 = require('xoauth2');
var OAuth2 = require('oauth').OAuth2;


module.exports.startServer = function() {
  app = express();

  // configure middleware
  app.use(bodyParser());  // Parses json
  app.use(favicon(__dirname + '/public/images/favicon.ico'));


  /* Basic funk-tionality */

 
  /* API Routes */
  app.get('/', function(req, res) {

    var authorizeConfig = {
      response_type: 'code',
      redirect_uri: 'http://localhost:3000/callback',
      scope: 'https://mail.google.com/',
      access_type: 'offline'
    };

    var server = 'https://accounts.google.com/o/';

    var oauth2 = new OAuth2(cfg.CLIENT_ID, cfg.CLIENT_SECRET, server, 'oauth2/auth', 'oauth2/token', null);

    console.log('redirecting');
    res.redirect(oauth2.getAuthorizeUrl(authorizeConfig));
  });

  app.get('/callback', function(req, res) {
    var code = req.query.code;

    var server = 'https://accounts.google.com/o/';

    var oauth2 = new OAuth2(cfg.CLIENT_ID, cfg.CLIENT_SECRET, server, 'oauth2/auth', 'oauth2/token', null);

    accessParams = { 'grant_type': 'authorization_code',
     'redirect_uri': 'http://localhost:3000/callback'
    };

    oauth2.getOAuthAccessToken(code, accessParams, function(err, access_token, refresh_token, results) {
      if(err) {
        console.log('Error: ');
        console.log(err);
      }
      
      console.log('Access Token: ');
      console.log(access_token);
      console.log('Refresh Token: ');
      console.log(refresh_token);

      console.log(results);
      
      if(refresh_token && access_token) {
        // Success!!
        res.send('success!');
      }
      else {
        res.send('got access token: ' + access_token);
      }
    });
  });

  app.get('/xoauth', function(req, res) {

  });

  app.get('/mail', function(req, res) {

    // Mail server //

    var mailListener = new MailListener({
      xoauth2: '',
      username: cfg.MAIL_USERNAME,
      password: cfg.MAIL_PASSWORD,
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
    });

    mailListener.on("attachment", function(attachment){
      console.log('wtf, an attachment?!');
      console.log(attachment.path);
    });

  });


  app.listen(cfg.PORT);

};


