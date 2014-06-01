var OAuth2 = require('oauth').OAuth2;

exports = module.exports = Gmail;

function Gmail(cfg) {
    this.options = {
        clientId: cfg.CLIENT_ID,
        clientSecret: cfg.CLIENT_SECRET
    };

    return(null);
}

Gmail.prototype.getAuthUrl = function() {
    /* Step 1: Get an Auth Url from google (requires clientId and clientSecret) */
    var authorizeConfig = {
      response_type: 'code',
      redirect_uri: 'http://localhost:3000/callback',
      scope: 'https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email', // Access user's e-mail and access user's e-mail address
      access_type: 'offline'
    };

    var server = 'https://accounts.google.com/o/';
    var oauth2 = new OAuth2(this.options.clientId, this.options.clientSecret, server, 'oauth2/auth', 'oauth2/token', null);

    var authUrl = oauth2.getAuthorizeUrl(authorizeConfig);

    return(authUrl);
};

Gmail.prototype.getAccessToken = function(code, callback) {
    /* Step 2: Get an Access Token from google (requires 'code' from getAuthUrl) */

    var server = 'https://accounts.google.com/o/';

    var oauth2 = new OAuth2(this.options.clientId, this.options.clientSecret, server, 'oauth2/auth', 'oauth2/token', null);

    accessParams = { 'grant_type': 'authorization_code',
     'redirect_uri': 'http://localhost:3000/callback'
    };

    oauth2.getOAuthAccessToken(code, accessParams, function(err, access_token, refresh_token, results) {
      if(err) {
        console.log('Error: ');
        console.log(err);
      }
      
      console.log(results);
      callback(results);
    });
};

Gmail.prototype.getXOauth2 = function(email, access_token) {
    // Grabs an XOauth2 token after retrieving the access_token
    var query_string = 'user=' + email + '\1auth=Bearer ' + access_token + '\1\1';

    var buffer = new Buffer(query_string);
    var encoded_string = buffer.toString('base64');

    console.log(encoded_string);

    return(encoded_string);
};