var util = require('util');

/** * @namespace */
var Utils = module.exports;

/**
 *  Generates a JSON-RPC 2.0 request
 *  @param {String} method Name of method to call
 *  @param {Array|Object} params Array of parameters passed to the method as specified, or an object of parameter names and corresponding value
 *  @param {String|Number|null} [id] Request ID can be a string, number, null for explicit notification or left out for automatic generation
 *  @param {Object} [options] Optional name => value pairs of settings
 *  @throws {TypeError} If any of the parameters are invalid
 *  @return {Object} A JSON-RPC 2.0 request
 *  @api public
 */
Utils.request = function(method, params, id, options) {
  if(typeof(method) !== 'string') {
    throw new TypeError(method + ' must be a string');
  }

  if(!params || (typeof(params) !== 'object' && !Array.isArray(params))) {
    throw new TypeError(params + ' must be an object or an array');
  }

  options = options || {};

  var request = {
    jsonrpc: "2.0",
    params: params,
    method: method
  };

  // if id was left out, generate one (null means explicit notification)
  if(typeof(id) === 'undefined') {
    var generator = typeof(options.generator) === 'function' ? options.generator : Utils.generateId;
    request.id =  generator(request);
  } else {
    request.id = id;
  }
  
  return request;
};

/**
 *  Generates a JSON-RPC 2.0 response
 *  @param {Object} error Error member
 *  @param {Object} result Result member
 *  @param {String|Number|null} id Id of request
 *  @return {Object} A JSON-RPC 2.0 response
 *  @api public
 */
Utils.response = function(error, result, id) {
  id = typeof(id) === 'undefined' || id === null ? null : id;
  var response = { jsonrpc: "2.0", id: id };
  // one or the other with precedence for errors
  if(error) response.error = error;
  else response.result = result;
  return response;
};

/**
 *  Generates a random id
 *  @return {Number}
 *  @api public
 */
Utils.generateId = function() {
   return Math.round(Math.random() * Math.pow(2, 24));
};

/**
 *  Merges properties of object b into object a
 *  @param {Object} a
 *  @param {Object} b
 *  @return {Object}
 *  @api private
 */
Utils.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 *  Helper to parse a HTTP request body and interpret it as JSON
 *  @param {ServerRequest} req node.js ServerRequest instance
 *  @param {Function} [reviver] Optional reviver for JSON.parse
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
Utils.parseBody = function(req, reviver, callback) {
  if(!callback && typeof(reviver) === 'function') {
    callback = reviver;
    reviver = null;
  }

  var data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { data += chunk; });
  req.on('end', function() {
    try {
      var request = JSON.parse(data, reviver);
    } catch(err) {
      return callback(err);
    }
    callback(null, request);
  });
};

/**
 *  Returns a HTTP request listener bound to the server in the argument. "this" must be an instanceof jayson.Server.http or jayson.Server.https
 *  @param {JaysonServer} server Instance of JaysonServer (typically jayson.Server)
 *  @return {Function}
 *  @api private
 */
Utils.httpRequestWrapper = function(server) {
  var self = this;
  return function(req, res) {
    var options = self.options || {};

    //  405 method not allowed if not POST
    if(!Utils.isMethod(req, 'POST')) return respondError('Method not allowed', 405, { 'allow': 'POST' });

    // 415 unsupported media type if content-type is not correct
    if(!Utils.isContentType(req, 'application/json')) return respondError('Unsupported media type', 415);

    Utils.parseBody(req, options.reviver, function(err, request) {
      // parsing failed, 500 server error
      if(err) return respondError(err, 500);

      server.call(request, function(error, success) {
        var response = error || success;
        if(response) {
          var body = '';
          // stringifies JSON
          try {
            body = JSON.stringify(response, options.replacer);
          } catch(err) {
            return respondError(err, 400);
          }
          var headers = {
            "content-length": Buffer.byteLength(body, options.encoding),
            "content-type": "application/json"
          };
          res.writeHead(200, headers);
          res.write(body);
          res.end();
        } else {
          // no response received at all, must be a notification
          res.writeHead(204);
          res.end();
        }
      });

    });

    // ends the request with an error code
    function respondError(err, code, headers) {
      res.writeHead(code, headers || {});
      res.end(String(err));
    }

  };
};

/**
 *  Determines if a HTTP Request comes with a specific content-type
 *  @param {ServerRequest} request
 *  @param {String} type
 *  @return {Boolean}
 *  @api private
 */
Utils.isContentType = function(request, type) {
  request = request || {headers: {}};
  var contentType = request.headers['content-type'] || '';
  return RegExp(type, 'i').test(contentType);
};

/**
 *  Determines if a HTTP Request is of a specific method
 *  @param {ServerRequest} request
 *  @param {String} method
 *  @return {Boolean}
 *  @api private
 */
Utils.isMethod = function(request, method) {
  method = (method || '').toUpperCase();
  return (request.method || '') === method;
};

/**
 *  Determines the parameter names of a function
 *  @param {Function} func
 *  @return {Array}
 *  @api private
 */
Utils.getParameterNames = function(func) {
  if(typeof(func) !== 'function') return [];
  var body = func.toString();
  var args = /^function \((.+?)\)/.exec(body);
  if(!args) return [];
  var list = (args.pop() || '').split(',');
  return list.map(function(arg) { return arg.trim(); });
};

// For quick access in classes
Utils.inherits = util.inherits;
