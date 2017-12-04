var promisify = require('es6-promisify');
var jayson = require('../../../');
var promiseUtils = require('../utils');

/**
 * Constructor for a Jayson Promise Client Tcp
 * @see Client
 * @class PromiseClientTcp
 * @extends ClientTcp
 * @return {PromiseClientTcp}
 */
var PromiseClientTcp = function(options) {
  if(!(this instanceof PromiseClientTcp)) {
    return new PromiseClientTcp(options);
  }
  jayson.Client.tcp.apply(this, arguments);
  this.request = promiseUtils.wrapClientRequestMethod(this.request.bind(this));
};
require('util').inherits(PromiseClientTcp, jayson.Client.tcp);

module.exports = PromiseClientTcp;
