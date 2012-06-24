var https = require('https');
var utils = require('../utils');

/**
 *  Constructor for a Jayson HTTPS server
 *  @class Jayson JSON-RPC HTTPS Server
 *  @extends https.Server
 *  @return {HttpServer}
 *  @api public
 */
var HttpsServer = module.exports = function(server, options) {
  if(!(this instanceof HttpsServer)) return new HttpsServer(server, options);
  https.Server.call(this, utils.httpRequestWrapper(server, options));
};
utils.inherits(HttpsServer, https.Server);
