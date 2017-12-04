var promisify = require('es6-promisify');
var jayson = require('../../../');
var promiseUtils = require('../utils');

/**
 * Constructor for a Jayson Promise Client Tls
 * @see Client
 * @class PromiseClientTls
 * @extends ClientTls
 * @return {PromiseClientTls}
 */
var PromiseClientTls = function(options) {
  if(!(this instanceof PromiseClientTls)) {
    return new PromiseClientTls(options);
  }
  jayson.Client.tls.apply(this, arguments);
  this.request = promiseUtils.wrapClientRequestMethod(this.request.bind(this));
};
require('util').inherits(PromiseClientTls, jayson.Client.tls);

module.exports = PromiseClientTls;
