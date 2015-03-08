var https = require('https');
var utils = require('../utils');
var HttpClient = require('./http');

/**
 *  Constructor for a Jayson HTTPS Client
 *  @class ClientHttps
 *  @constructor
 *  @extends ClientHttp
 *  @param {Object|String} [options] String interpreted as a URL
 *  @param {String} [options.encoding="utf8"] Encoding to use
 *  @return {ClientHttps}
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
