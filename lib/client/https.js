var https = require('https');
var utils = require('../utils');
var HttpClient = require('./http');

/**
 *  Constructor for a Jayson HTTPS Client
 *  @class Jayson JSON-RPC HTTPS Client
 *  @constructor
 *  @extends HttpClient
 *  @param {Object|String} [options] Optional hash of settings or a URL
 *  @return {HttpsClient}
 *  @api public
 */
var HttpsClient = function(options) {
  if(!(this instanceof HttpsClient)) return new HttpsClient(options);
  // just proxy to constructor for HttpClient
  HttpClient.call(this, options);
};
require('util').inherits(HttpsClient, HttpClient);

module.exports = HttpsClient;

/**
 *  Gets a stream interface to a https server
 *  @param {Object} options An options object
 *  @return {require('https').ClientRequest}
 *  @api private
 */
HttpsClient.prototype._getRequestStream = function(options) {
  return https.request(options || {});
};
