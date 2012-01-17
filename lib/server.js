var events = require('events');
var utils = require(__dirname + '/utils');

var interfaces = {
  http: require(__dirname + '/server/http'),
  tcp: require(__dirname + '/server/tcp'),
  middleware: require(__dirname + '/server/middleware')
};

var Server = module.exports = function(methods) {
  if(!(this instanceof Server)) return new Server(methods);

  this._methods = {};

  // adds methods passed to constructor
  this.methods(methods || {});

  // assigns interfaces to this instance
  for(var name in interfaces) {
    this[name] = interfaces[name].bind(undefined, this);
  }
};

Server.errors = Server.prototype.errors = {
  PARSE_ERROR: { code: -32700, message: 'Parse Error' },
  INVALID_REQUEST: { code: -32600, message: 'Invalid Request' },
  METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
  INVALID_PARAMS: { code: -32602, message: 'Invalid method parameter(s)' },
  INTERNAL_ERROR: { code: -32603, message: 'Internal error' }
};

/**
 *  Adds a single method to the server
 *  @param {String} name
 *  @param {Function} definition
 *  @return {void}
 *  @api public
 */
Server.prototype.method = function(name, definition) {
  if(typeof(definition) !== 'function') return;
  if(!name || typeof(name) !== 'string') throw new TypeError('JSON-RPC method name must be a non-zero length string');
  if(/^rpc\./.test(name)) throw new TypeError('JSON-RPC method names that begin with "rpc." are reserved');
  this._methods[name] = definition;
};

/**
 *  Adds a batch of methods to the server
 *  @param {Object} methods
 *  @return {void}
 *  @api public
 */
Server.prototype.methods = function(methods) {
  methods = methods || {};
  for(var name in methods) this.method(name, methods[name]);
};

/**
 *  Checks if a method of name is registered with the server
 *  @param {String} name
 *  @return {Boolean}
 *  @api public
 */
Server.prototype.hasMethod = function(name) {
  return name in this._methods;
};

/**
 *  Removes a method from the server by name
 *  @param {String} name
 *  @return {void}
 *  @api public
 */
Server.prototype.removeMethod = function(name) {
  if(this.hasMethod(name)) {
    delete this._methods[name];
  }
};

/**
 *  Calls a JSON-RPC 2.0 method on the server
 *  @param {Object} request
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
Server.prototype.call = function(request, callback) {
  request = request || {};

  // do we have valid JSON?
  try {
    // if passed a string, assume that it should be parsed
    if(typeof(request) === 'string') request = JSON.parse(request);
    request = JSON.parse(JSON.stringify(request));
  } catch(e) {
    return callback(utils.response(this.errors.PARSE_ERROR, null, null));
  }

  // is this a batch request?
  if(Array.isArray(request)) {
    // special case if empty request
    if(request.length === 0) {
      return callback(utils.response(this.errors.INVALID_REQUEST, null, null));
    }
    return this._batch(request, callback);
  }

  // is the request valid?
  if(!isValidRequest(request)) {
    return callback(utils.response(this.errors.INVALID_REQUEST, null, null));
  }

  // now we are "notification"-aware and can ignore errors for such requests
  var respond = function(error, result) {
    if(isNotification(request)) return callback();
    var response = utils.response(error, result, request.id);
    if(response.error) callback(response);
    else callback(null, response);
  };
  
  // does the method exist?
  if(!this.hasMethod(request.method)) {
    return respond(this.errors.METHOD_NOT_FOUND);
  }

  var args = [];
  var method = this._methods[request.method];

  // make an array out of named parameters because we can't support them yet
  if(request.params && !Array.isArray(request.params)) {
    for(name in request.params) args.push(request.params[name]);
  }

  // adds request params to arguments for the method
  if(Array.isArray(request.params)) {
    args = args.concat(request.params);
  }

  // the callback that methods of the server receives
  args.push(function(error, result) {
    if(isError(error)) return respond(error);

    // got a different error, or not an error nor a result
    if(error || (!error && !result)) {
      return respond(this.errors.INTERNAL_ERROR);
    }

    respond(null, result);
  });

  // calls the requested method with the server as this
  method.apply(this, args);
};

Server.prototype._batch = function(requests, callback) {
  var self = this;
  
  var responses = [];

  var maybeRespond = function() {
    var done = responses.every(function(res) { return res  !== null; });
    if(done) {
      // filters away notifications
      var filtered = responses.filter(function(res) { return res !== true; });
      // only notifications means empty response
      if(!filtered.length) return callback();
      callback(null, filtered);
    }
  }

  var wrapper = function(request, index) {
    responses[index] = null;
    return function() {
      if(!isValidRequest(request)) {
        responses[index] = utils.response(self.errors.INVALID_REQUEST);
        maybeRespond();
      } else {
        self.call(request, function(error, response) {
          responses[index] = error || response || true;
          maybeRespond();
        });
      }
    }
  };

  var stack = requests.map(function(request, index) {
    // ignore possibly nested requests
    if(Array.isArray(request)) return null;
    return wrapper(request, index);
  });

  stack.forEach(function(method) {
    if(typeof(method) === 'function') method();
  });
};

function isValidRequest(request) {
  return Boolean(
    request
    && typeof(request) === 'object'
    && request.jsonrpc === "2.0"
    && typeof(request.method) === 'string'
    && (
      typeof(request.params) === 'undefined'
      || Array.isArray(request.params)
      || (request.params && typeof(request.params) === 'object')
    )
    && (
      typeof(request.id) === 'undefined'
      || typeof(request.id) === 'string'
      || typeof(request.id) === 'number'
      || request.id === null
    )
  );
}

function isNotification(request) {
  request = request || {};
  return !request.id;
}

function isError(error) {
  return Boolean(
    error
    && typeof(error.code) === 'number'
    && parseInt(error.code) == error.code
    && (
      typeof(error.message) === 'undefined'
      || typeof(error.message) === 'string'
    )
  );
}
