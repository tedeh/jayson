var promisify = require('es6-promisify');
var jayson = require('../../../');

/**
 * Constructor for a Jayson Promise Client Http
 * @see Client
 * @class PromiseClientHttp
 * @extends ClientHttp
 * @return {PromiseClientHttp}
 */
var PromiseClientHttp = function(options) {
  if(!(this instanceof PromiseClientHttp)) {
    return new PromiseClientHttp(options);
  }
  jayson.Client.http.apply(this, arguments);
  this.request = promisify(this.request);
};
require('util').inherits(PromiseClientHttp, jayson.Client.http);

module.exports = PromiseClientHttp;
