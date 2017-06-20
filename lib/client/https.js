var https = require('https');
var ClientHttp = require('./http');

/**
 *  Constructor for a Jayson HTTPS Client
 *  @class ClientHttps
 *  @constructor
 *  @extends ClientHttp
 *  @param {Object|String} [options] String interpreted as a URL
 *  @param {String} [options.encoding="utf8"] Encoding to use
 *  @return {ClientHttps}
 */
var ClientHttps = function(options) {
  if(!(this instanceof ClientHttps)) {
    return new ClientHttps(options);
  }
  // just proxy to constructor for ClientHttp
  ClientHttp.call(this, options);
};
require('util').inherits(ClientHttps, ClientHttp);

module.exports = ClientHttps;

/**
 *  Gets a stream interface to a https server
 *  @param {Object} options An options object
 *  @return {require('https').ClientRequest}
 *  @private
 */
ClientHttps.prototype._getRequestStream = function(options) {
  return https.request(options || {});
};
