/* Configuration File - contains all hardcoded values */

exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.HOSTNAME = process.env.HOSTNAME || 'localhost';
exports.PORT = process.env.PORT || 3000;

exports.MAIL_USERNAME = process.env.MAIL_USERNAME || '';
exports.MAIL_PASSWORD = process.env.MAIL_PASSWORD || '';

// Server - gmail
exports.MAIL_HOST = process.env.MAIL_HOST || 'imap.gmail.com';
exports.MAIL_PORT = process.env.MAIL_PORT || 993;
