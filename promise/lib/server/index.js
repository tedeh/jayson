var promisify = require('es6-promisify');
var jayson = require('../../../');

/**
 * Constructor for a Jayson Promise Server
 * @see Server
 * @class PromiseServer
 * @extends Server
 * @return {PromiseServer}
 * @api public
 */
var PromiseServer = function(methods, options) {
  if(!(this instanceof PromiseServer)) {
    return new PromiseServer(methods, options);
  }
  jayson.Server.apply(this, arguments);
  this.call = promisify(this.call);
};
require('util').inherits(PromiseServer, jayson.Server);

module.exports = PromiseServer;
