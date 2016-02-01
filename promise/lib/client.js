var _ = require('lodash');
var promisify = require('es6-promisify');
var jayson = require('../../../');

/**
 * Constructor for a Jayson Promise Client
 * @see Client
 * @class PromiseClient
 * @extends Client
 * @return {PromiseClient}
 * @api public
 */
var PromiseClient = function(server, options) {
  if(!(this instanceof PromiseClient)) {
    return new PromiseClient(server, options);
  }
  jayson.Client.apply(this, arguments);
  this.request = promisify(this.request);
};
require('util').inherits(PromiseClient, jayson.Client);

_.extend(PromiseClient, _.omit(jayson.Client, '_super'));

module.exports = PromiseClient;
