var promisify = require('es6-promisify');
var jayson = require('../../../');

/**
 * Constructor for a Jayson Promise Client
 * @see Client
 * @class PromiseClient
 * @extends Client
 * @return {PromiseClient}
 */
var PromiseClient = function(server, options) {
  if(!(this instanceof PromiseClient)) {
    return new PromiseClient(server, options);
  }
  jayson.Client.apply(this, arguments);
  this.request = promisify(this.request);
};
require('util').inherits(PromiseClient, jayson.Client);

/**
 * @type PromiseClientHttp
 * @static
 */
PromiseClient.http = require('./http');

/**
 * @type PromiseClientHttps
 * @static
 */
PromiseClient.https = require('./https');

/**
 * @type PromiseClientTls
 * @static
 */

PromiseClient.tls = require('./tls');
/**
 * @type PromiseClientTcp
 * @static
 */
PromiseClient.tcp = require('./tcp');

module.exports = PromiseClient;
