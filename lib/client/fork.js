var utils = require('../utils');
var Client = require('../client');

/**
 *  Constructor for a Jayson HTTP Client
 *  @class Jayson JSON-RPC Fork Client
 *  @extends Client
 *  @param {Server} server An instance of Server
 *  @param {Object} [options] Optional hash of settings
 *  @return {ForkClient}
 *  @api public
 */
var ForkClient = function(server, options) {
  if(!(this instanceof ForkClient)) return new ForkClient(server, options);
  Client.apply(this, arguments);
  
  var defaults = utils.merge(this.options, {});

  this.options = utils.merge(defaults, options || {});
};
utils.inherits(ForkClient, Client);

module.exports = ForkClient;

ForkClient.prototype._request = function(request, callback) {
  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);
  this.server.call(request, callback);
};
