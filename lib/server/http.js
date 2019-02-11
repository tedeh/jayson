'use strict';

const http = require('http');
const utils = require('../utils');

/**
 *  Constructor for a Jayson HTTP server
 *  @class ServerHttp
 *  @extends require('http').Server
 *  @param {Server} server Server instance
 *  @param {Object} [options] Options for this instance
 *  @return {ServerHttp}
 */
const HttpServer = function(server, options) {
  if(!(this instanceof HttpServer)) {
    return new HttpServer(server, options);
  }

  this.options = utils.merge(server.options, options || {});

  const listener = utils.getHttpListener(this, server);
  http.Server.call(this, listener);
};
require('util').inherits(HttpServer, http.Server);

module.exports = HttpServer;
