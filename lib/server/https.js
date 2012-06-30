var https = require('https');
var utils = require('../utils');

/**
 *  Constructor for a Jayson HTTPS server
 *  @class Jayson JSON-RPC HTTPS Server
 *  @extends require('https').Server
 *  @param {Server} server Server instance
 *  @param {Object} [options] Options for this instance
 *  @return {HttpServers}
 *  @api public
 */
var HttpsServer = function(server, options) {
  if(!(this instanceof HttpsServer)) return new HttpsServer(server, options);
  https.Server.call(this, utils.httpRequestWrapper(server, options));
};
utils.inherits(HttpsServer, https.Server);

module.exports = HttpsServer;
