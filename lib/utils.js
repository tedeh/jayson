var util = require('util');

/**
 *  Generates a JSON-RPC 2.0 request
 *  @param {String} method
 *  @param {Array|Object} params
 *  @param {String|Number|null} id
 *  @param {Function} callback
 *  @return {Object}
 *  @api public
 */
exports.request = function(method, params, id) {
  if(typeof(method) !== 'string') {
    throw new TypeError(method + ' must be a string');
  }

  if(!params || (typeof(params) !== 'object' && !Array.isArray(params))) {
    throw new TypeError(params + ' must be an object or an array');
  }

  var request = {
    jsonrpc: "2.0",
    params: params,
    method: method
  };

  // if id was left out, generate one (null means explicit notification)
  if(typeof(id) === 'undefined') {
    request.id = exports.generateId();
  } else {
    request.id = id;
  }
  
  return request;
};

/**
 *  Generates a JSON-RPC 2.0 response
 *  @param {Object} error
 *  @param {Object} result
 *  @param {String|Number|null} id
 *  @return {Object}
 *  @api public
 */
exports.response = function(error, result, id) {
  id = id || null;
  var response = { jsonrpc: "2.0", id: id };
  // one or the other with precedence for errors
  if(error) response.error = error;
  else response.result = result;
  return response;
};

/**
 *  Generates a random id
 *  @return {Number}
 *  @api private
 */
exports.generateId = function() {
   return Math.round(Math.random() * Math.pow(2, 24));
};

/**
 *  Merges properties of object b into object a
 *  @param {Object} a
 *  @param {Object} b
 *  @return {Object}
 *  @api public
 */
exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 *  Helper to parse a HTTP request body and interpret it as JSON
 *  @param {ServerRequest} req
 *  @param {Function} reviver
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
exports.parseBody = function(req, reviver, callback) {
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
 *  Wraps a server instance around a HTTP request listener (used by the HTTP and HTTPS server modules)
 *  @param {JaysonServer} server
 *  @param {Object} options
 *  @return {Function}
 *  @api private
 */
exports.httpRequestWrapper = function(server, options) {
  return function(req, res) {
    options = exports.merge(server.options, options || {});

    //  405 method not allowed if not POST
    if(!exports.isMethod(req, 'POST')) return error(405, { 'allow': 'POST' });

    // 415 unsupported media type if content-type is not correct
    if(!exports.isContentType(req, 'application/json')) return error(415);

    exports.parseBody(req, options.reviver, function(err, request) {
      // parsing failed, 500 server error
      if(err) return error(500);

      server.call(request, function(error, success) {
        var response = error || success;
        exports.stringify(response, options.replacer, function(err, body) {
          // stringify failed, 500 server error
          if(err) return error(500);
          var headers = {
            "content-length": Buffer.byteLength(body, options.encoding),
            "content-type": "application/json"
          };
          res.writeHead(200, headers);
          res.write(body);
          res.end();
        });
      });

    });

    // ends the request with an error code
    function error(code, headers) {
      res.writeHead(code, headers || {});
      res.end();
    }

  };
};

/**
 *  Helper to stringify a JavaScript object into JSON
 *  @param {Object} object
 *  @param {Function} replacer
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
exports.stringify = function(object, replacer, callback) {
  if(!callback && typeof(replacer) === 'function') {
    callback = replacer;
    replacer = null;
  }

  if(typeof(callback) !== 'function') {
    callback = function() {};
  }

  try {
    var str = JSON.stringify(object, replacer);
  } catch(err) {
    return callback(err);
  }

  callback(null, str);
  return str;
};

/**
 *  Helper to parse a string into JSON
 *  @param {String} str
 *  @param {Function} reviver
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
exports.parse = function(str, reviver, callback) {
  if(!callback && typeof(reviver) === 'function') {
    callback = reviver;
    reviver = null;
  }

  if(typeof(callback) !== 'function') {
    callback = function() {};
  }

  if(typeof(str) !== 'string') {
    throw new TypeError(str + ' must be a String');
  }

  try {
    var object = JSON.parse(str, reviver);
  } catch(err) {
    var error = new SyntaxError('Invalid JSON: "' + str + '"');
    return callback(error);
  }

  callback(null, object);
  return object;
};

/**
 *  Determines if a HTTP Request comes with a specific content-type
 *  @param {ServerRequest} request
 *  @param {String} type
 *  @return {Boolean}
 *  @api public
 */
exports.isContentType = function(request, type) {
  request = request || {headers: {}};
  var contentType = request.headers['content-type'] || '';
  return RegExp(type, 'i').test(contentType);
};

/**
 *  Determines if a HTTP Request is of a specific method
 *  @param {ServerRequest} request
 *  @param {String} method
 *  @return {Boolean}
 *  @api public
 */
exports.isMethod = function(request, method) {
  method = (method || '').toUpperCase();
  return (request.method || '') === method;
};

/**
 *  Determines the parameter names of a function
 *  @param {Function} func
 *  @return {Array}
 *  @api public
 */
exports.getParameterNames = function(func) {
  if(typeof(func) !== 'function') return [];
  var body = func.toString();
  var args = /^function \((.+?)\)/.exec(body);
  if(!args) return [];
  var list = (args.pop() || '').split(',');
  return list.map(function(arg) { return arg.trim(); });
};

exports.inherits = util.inherits;
