var promisify = require('es6-promisify');
var jayson = require('../../../');
var promiseUtils = require('../utils');

/**
 * Constructor for a Jayson Promise Client Http
 * @see Client
 * @class PromiseClientHttps
 * @extends ClientHttps
 * @return {PromiseClientHttps}
 */
var PromiseClientHttps = function(options) {
  if(!(this instanceof PromiseClientHttps)) {
    return new PromiseClientHttps(options);
  }
  jayson.Client.https.apply(this, arguments);
  this.request = promiseUtils.wrapClientRequestMethod(this.request.bind(this));
};
require('util').inherits(PromiseClientHttps, jayson.Client.https);

module.exports = PromiseClientHttps;

