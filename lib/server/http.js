var http = require('http');
var utils = require('../utils');

/**
 *  Constructor for a Jayson HTTP server
 *  @class Jayson JSON-RPC HTTP Server
 *  @extends require('http').Server
 *  @param {Server} server Server instance
 *  @param {Object} [options] Options for this instance
 *  @return {HttpServer}
 *  @api public
 */
var HttpServer = function(server, options) {
  if(!(this instanceof HttpServer)) return new HttpServer(server, options);

  this.options = utils.merge(server.options, options || {});

  var listener = utils.getHttpListener(this, server);
  http.Server.call(this, listener);
};
require('util').inherits(HttpServer, http.Server);

module.exports = HttpServer;
