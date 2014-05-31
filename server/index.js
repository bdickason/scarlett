/* index.js - Start up the server */

var cfg = require('./cfg/config.js');

var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var OAuth2 = require('oauth').OAuth2;
var MailListener = require('mail-listener2');


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
        res.redirect('/mail?access_token=' + access_token);
      }
    });
  });

  app.get('/mail', function(req, res) {
    // Monitors your mailbox for new mail to come in
    
    var email = req.query.email;
    var access_token = req.query.access_token;

    // Mail server //
    var xoauth2 = getXOauth2(email, access_token);

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
    });

    mailListener.on("attachment", function(attachment){
      console.log('wtf, an attachment?!');
      console.log(attachment.path);
    });

  });

  getXOauth2 = function(email, access_token) {
    // Grabs an XOauth2 token after retrieving the access_token
    var query_string = 'user=' + email + '\1auth=Bearer ' + access_token + '\1\1';

    var buffer = new Buffer(query_string);
    var encoded_string = buffer.toString('base64');

    return(encoded_string);
  };


  app.listen(cfg.PORT);

};

