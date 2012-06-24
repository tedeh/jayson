var http = require('http');
var utils = require('../utils');

/**
 *  Constructor for a Jayson HTTP server
 *  @class Jayson JSON-RPC HTTP Server
 *  @extends require('http').Server
 *  @return {HttpServer}
 *  @api public
 */
var HttpServer = module.exports = function(server, options) {
  if(!(this instanceof HttpServer)) return new HttpServer(server, options);
  http.Server.call(this, utils.httpRequestWrapper(server, options));
};
utils.inherits(HttpServer, http.Server);
