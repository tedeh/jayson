var events = require('events');
var utils = require(__dirname + '/utils');

var interfaces = {
  http: require(__dirname + '/server/http'),
  middleware: require(__dirname + '/server/middleware')
};

var JaysonServer = module.exports = function(methods, options) {
  if(!(this instanceof JaysonServer)) return new JaysonServer(methods, options);

  var defaults = {
    reviver: null,
    replacer: null,
    encoding: 'utf8'
  };

  this.options = utils.merge(defaults, options || {});
  
  this._methods = {};

  // adds methods passed to constructor
  this.methods(methods || {});

  // assigns interfaces to this instance
  for(var name in interfaces) {
    this[name] = interfaces[name].bind(undefined, this);
  }

  // copies error messages for defined codes into this instance
  this.errorMessages = {};
  for(var handle in JaysonServer.errors) {
    var code = JaysonServer.errors[handle];
    this.errorMessages[code] = JaysonServer.errorMessages[code];
  }

};

// pre-defined errors
JaysonServer.errors = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
};

// pre-defined default error messages
JaysonServer.errorMessages = {};
JaysonServer.errorMessages[JaysonServer.errors.PARSE_ERROR] = 'Parse Error';
JaysonServer.errorMessages[JaysonServer.errors.INVALID_REQUEST] = 'Invalid request';
JaysonServer.errorMessages[JaysonServer.errors.METHOD_NOT_FOUND] = 'Method not found';
JaysonServer.errorMessages[JaysonServer.errors.INVALID_PARAMS] = 'Invalid method parameter(s)';
JaysonServer.errorMessages[JaysonServer.errors.INTERNAL_ERROR] = 'Internal error';

/**
 *  Adds a single method to the server
 *  @param {String} name
 *  @param {Function} definition
 *  @return {void}
 *  @api public
 */
JaysonServer.prototype.method = function(name, definition) {
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
JaysonServer.prototype.methods = function(methods) {
  methods = methods || {};
  for(var name in methods) this.method(name, methods[name]);
};

/**
 *  Checks if a method of name is registered with the server
 *  @param {String} name
 *  @return {Boolean}
 *  @api public
 */
JaysonServer.prototype.hasMethod = function(name) {
  return name in this._methods;
};

/**
 *  Removes a method from the server by name
 *  @param {String} name
 *  @return {void}
 *  @api public
 */
JaysonServer.prototype.removeMethod = function(name) {
  if(this.hasMethod(name)) {
    delete this._methods[name];
  }
};

/**
 *  Returns the error member for an error response
 *  @param {Number} code
 *  @param {String} message
 *  @param {Object} [data]
 *  @return {Object}
 *  @api public
 */
JaysonServer.prototype.error = function(code, message, data) {
  if(typeof(code) !== 'number') {
    code = JaysonServer.errors.INTERNAL_ERROR;
  }

  if(typeof(message) !== 'string') {
    message = this.errorMessages[code] || '';
  }

  var error = { code: code, message: message };
  if(typeof(data) !== undefined) error.data = data;
  return error;
};

/**
 *  Calls a JSON-RPC 2.0 method on the server
 *  @param {Object|Array} request
 *  @param {Function} [callback]
 *  @return {void}
 *  @api public
 */
JaysonServer.prototype.call = function(request, callback) {
  if(typeof(callback) !== 'function') callback = function() {};

  // do we have valid JSON?
  try {
    // if passed a string, assume that it should be parsed
    if(typeof(request) === 'string') request = JSON.parse(request);
    request = JSON.parse(JSON.stringify(request));
  } catch(e) {
    return callback(utils.response(this.error(JaysonServer.errors.PARSE_ERROR)));
  }

  // is this a batch request?
  if(Array.isArray(request)) {
    // special case if empty request
    if(request.length === 0) {
      return callback(utils.response(this.error(JaysonServer.errors.INVALID_REQUEST)));
    }
    return this._batch(request, callback);
  }

  // is the request valid?
  if(!isValidRequest(request)) {
    return callback(utils.response(this.error(JaysonServer.errors.INVALID_REQUEST)));
  }

  // from now on we are "notification"-aware and can deliberately ignore errors for such requests
  var respond = function(error, result) {
    if(isNotification(request)) return callback();
    var response = utils.response(error, result, request.id);
    if(response.error) callback(response);
    else callback(null, response);
  };
  
  // does the method exist?
  if(!this.hasMethod(request.method)) {
    return respond(this.error(JaysonServer.errors.METHOD_NOT_FOUND));
  }

  var args = [];
  var method = this._methods[request.method];

  // deal with named parameters in request
  if(request.params && !Array.isArray(request.params)) {
    var parameters = utils.getParameterNames(method);

    // pop the last one out because it should be the callback
    parameters.pop();

    // TODO deal with strictness (missing params etc)
    args = parameters.map(function(name) {
      return request.params[name];
    });
  }

  // adds request params to arguments for the method
  if(Array.isArray(request.params)) {
    args = args.concat(request.params);
  }

  // the callback that methods of the server receives
  args.push(function(error, result) {
    if(isValidError(error)) return respond(error);

    // got an invalid error, or not an error nor a result
    if(error || (!error && !result)) {
      return respond(this.error(JaysonServer.errors.INTERNAL_ERROR));
    }

    respond(null, result);
  });

  // calls the requested method with the server as this
  method.apply(this, args);
};

JaysonServer.prototype._batch = function(requests, callback) {
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
        responses[index] = utils.response(self.error(JaysonServer.errors.INVALID_REQUEST));
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

// is the passed argument a valid JSON-RPC request?
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

// is the passed argument JSON-RPC notification?
function isNotification(request) {
  return Boolean(
    request
    && (
      typeof(request.id) === 'undefined'
      || request.id === null
    )
  );
}

// is the passed argument a valid JSON-RPC error?
function isValidError(error) {
  return Boolean(
    error
    && typeof(error.code) === 'number'
    && parseInt(error.code) == error.code
    && typeof(error.message) === 'string'
  );
}
