var Server = require('./server');
var utils = require('./utils');
var events = require('events');

/**
 *  Constructor for a Jayson Client
 *  @class Jayson JSON-RPC Client
 *  @extends require('events').EventEmitter
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
    replacer: null,
    generator: utils.generateId,
    version: 2
  };

  this._notifications = {};

  this.options = utils.merge(defaults, options || {});

  if(server) this.server = server;
};
require('util').inherits(Client, events.EventEmitter);

module.exports = Client;

/**
 * HTTP client constructor
 * @type HttpClient
 * @static
 */
Client.http = require('./client/http');

/**
 * HTTPS client constructor
 * @type HttpsClient
 * @static
 */
Client.https = require('./client/https');

/**
 * TCP client constructor
 * @type TcpClient
 * @static
 */
Client.tcp = require('./client/tcp');

/**
 *  Creates a request and dispatches it if given a callback.
 *  @param {String|Array} method A batch request if passed an Array, or a method name if passed a String
 *  @param {Array|Object} params Parameters for the method
 *  @param {String|Number} [id] Optional id. If undefined an id will be generated. If null it creates a notification request
 *  @param {Function} [callback] Request callback. If specified, executes the request rather than only returning it.
 *  @throws {TypeError} Invalid parameters
 *  @return {Object} JSON-RPC 1.0 or 2.0 compatible request
 *  @api public
 */
Client.prototype.request = function(method, params, id, callback) {
  var self = this;

  // is this a batch request?
  var isBatch = Array.isArray(method) && typeof(params) === 'function';

  // JSON-RPC 1.0 doesn't support batching
  if (this.options.version === 1 && isBatch) {
    throw new TypeError('JSON-RPC 1.0 does not support batching')
  }

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
      var request = utils.request(method, params, id, {
        generator: this.options.generator,
        version: this.options.version
      });
    } catch(err) {
      if(hasCallback) return callback(err);
      throw err;
    }

    // no callback means we should just return a raw request
    if(!hasCallback) {
      return request;
    }
  }

  this.emit('request', request);

  this._request(request, function(err, response) {
    self.emit('response', request, response);
    self._parseResponse(err, response, callback);
  });

  // always return the raw request
  return request;
};

/**
 *  Executes a request on server bound directly
 *  @param {Object} request A JSON-RPC 1.0 or 2.0 request
 *  @param {Function} callback Request callback that will receive the server response as the second argument
 *  @return {void}
 *  @api private
 */
Client.prototype._request = function(request, callback) {
  var self = this;

  // serializes the request as a JSON string so that we get a copy and can run the replacer as intended
  utils.JSON.stringify(request, this.options, function(err, message) {
    if(err) throw err;

    self.server.call(message, function(error, success) {
      var response = error || success;
      callback(null, response);
    });

  });

};

Client.prototype.notify = function(request) {
  function getArgs(params) {
    if(request.params && !Array.isArray(request.params)) {
      return parameters.map(function(name) {
        return request.params[name];
      });
    }

    if(Array.isArray(request.params)) {
      return request.params;
    }
    return [];
  }

  if (this.options.version !== 1) {
    throw new TypeError('Only JSON-RPC 1.0 supports reciveing notifications from servers');
  }

  if (request.method in this._notifications) {
    this.emit('notification', request);
    var method = this._notifications[request.method];
    var args = getArgs(request.params);

    method.apply(null, args);
  }
};

Client.prototype.notification = function(name, definition) {
  if(typeof(definition) !== 'function') throw new TypeError(definition + ' must be a function');
  if(!name || typeof(name) !== 'string') throw new TypeError(name + ' must be a non-zero length string');
  this._notifications[name] = definition;
};

/**
 * Parses a response from a server
 * @param {Object} err Error to pass on that is unrelated to the actual response
 * @param {Object} response JSON-RPC 1.0 or 2.0 response
 * @param {Function} callback Callback that will receive different arguments depending on the amount of parameters
 * @return {void}
 * @api private
 */
Client.prototype._parseResponse = function(err, response, callback) {
  if(err) return callback(err);

  if(!response || typeof(response) !== 'object') {
    return callback();
  }

  if(callback.length === 3) {

    // split callback arguments on error and response

    // is batch response?
    if(Array.isArray(response)) {

      // neccesary to split strictly on validity according to spec here
      var isError = function(res) { return typeof(res.error) !== 'undefined'; };
      var isNotError = function(res) { return !isError(res); }
      callback(null, response.filter(isError), response.filter(isNotError));
    
    } else {

      // split regardless of validity
      return callback(null, response.error, response.result);
    
    }
  
  } else {

    return callback(null, response);
  
  }

};
