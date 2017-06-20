var https = require('https');
var utils = require('../utils');

/**
 *  Constructor for a Jayson HTTPS server
 *  @class ServerHttps
 *  @extends require('https').Server
 *  @param {Server} server Server instance
 *  @param {Object} [options] Options for this instance
 *  @return {ServerHttps}
 */
var HttpsServer = function(server, options) {
  if(!(this instanceof HttpsServer)) {
    return new HttpsServer(server, options);
  }

  this.options = utils.merge(server.options, options || {});

  var listener = utils.getHttpListener(this, server);
  https.Server.call(this, this.options, listener);
};
require('util').inherits(HttpsServer, https.Server);

module.exports = HttpsServer;
