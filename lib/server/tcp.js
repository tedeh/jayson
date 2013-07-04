var net = require('net');
var utils = require('../utils');

/**
 *  Constructor for a Jayson TCP server
 *  @class Jayson JSON-RPC TCP Server
 *  @extends require('net').Server
 *  @param {Server} server Server instance
 *  @param {Object} [options] Options for this instance
 *  @return {TcpServer}
 *  @api public
 */
var TcpServer = function(server, options) {
  if(!(this instanceof TcpServer)) return new TcpServer(server, options);

  this.options = utils.merge(server.options, options || {});

  var listenerWrapper = utils.tcpConnectionListenerWrapper.bind(this);
  net.Server.call(this, listenerWrapper(server));
};
utils.inherits(TcpServer, net.Server);

module.exports = TcpServer;
