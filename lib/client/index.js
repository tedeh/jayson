var Server = require('../server');
var utils = require('../utils');

/**
 *  Constructor for a Jayson Client
 *  @class Jayson JSON-RPC Client
 *  @param {Server} server An instance of Server
 *  @param {Object} [options] Optional hash of settings
 *  @return {Client}
 *  @api public
 */
var Client = function(server, options) {
  if(!(server instanceof Server) && arguments.length === 1) {
    options = server;
    server = null;
  }
  if(!(this instanceof Client)) return new Client(server, options);

  var defaults = {
    reviver: null,
    replacer: null
  };

  this.options = utils.merge(defaults, options || {});

  if(server) this.server = server;
};

module.exports = Client;

/**
 * HTTP(s) client constructor
 * @type HttpClient
 * @static
 */
Client.http = require('./http');

/**
 * Fork client constructor
 * @type ForkClient
 * @static
 */
Client.fork = require('./fork');

/**
 *  Creates a request and dispatches it if given a callback.
 *  @param {String|Array} method A batch request if passed an Array, or a method name if passed a String
 *  @param {Array|Object} params Parameters for the method
 *  @param {String|Number} [id] Optional id. If undefined an id will be generated. If null it creates a notification request
 *  @param {Function} [callback] Request callback. If specified, executes the request rather than only returning it.
 *  @return {Object} JSON-RPC 2.0 compatible request
 *  @api public
 */
Client.prototype.request = function(method, params, id, callback) {
  // is this a batch request?
  var isBatch = Array.isArray(method) && typeof(params) === 'function';

  // is this a raw request?
  var isRaw = !isBatch && method && typeof(method) === 'object' && typeof(params) === 'function';

  if(isBatch || isRaw) {
    callback = params;
    request = method;
  } else {
    if(typeof(id) === 'function') {
      callback = id;
      id = undefined; // specifically undefined because "null" is a notification request
    }

    var hasCallback = typeof(callback) === 'function';

    try {
      var request = utils.request(method, params, id);
    } catch(err) {
      if(hasCallback) return callback(err);
      throw err;
    }

    // no callback means we should just return a raw request
    if(!hasCallback) return request;
  }

  this._request(request, function(err, response) {
    if(err) return callback(err);

    if(!response) return callback();
    var isBatchResponse = Array.isArray(response);

    // different invocations of passed callback depending on its length
    if(callback.length === 3) {
      // if it was a batch, split successes and errors in two arrays
      if(isBatchResponse) {
        callback(null,
          response.filter(function(res) { return res.error; }),
          response.filter(function(res) { return res.hasOwnProperty('result'); })
        );
      } else if(response.error) {
        callback(null, response.error);
      } else {
        callback(null, null, response.result);
      }
    } else {
      callback(null, response);
    }
  });

  // always return the raw request
  return request;
};

/**
 *  Executes a request on a directly bound server
 *  @param {Object} request A JSON-RPC 2.0 request
 *  @param {Function} [callback] Request callback that will receive the server response as the second argument
 *  @return {void}
 *  @api private
 */
Client.prototype._request = function(request, callback) {
  this.server.call(request, function(error, success) {
    var response = error || success;
    callback(null, response);
  });
};
