var _ = require('underscore');
var JSONStream = require('JSONStream');

/** * @namespace */
var Utils = module.exports;

// same reference as other files use, for tidyness
var utils = Utils;

/**
 *  Generates a JSON-RPC 1.0 or 2.0 request
 *  @param {String} method Name of method to call
 *  @param {Array|Object} params Array of parameters passed to the method as specified, or an object of parameter names and corresponding value
 *  @param {String|Number|null} [id] Request ID can be a string, number, null for explicit notification or left out for automatic generation
 *  @param {Object} [options] Optional name => value pairs of settings
 *  @throws {TypeError} If any of the parameters are invalid
 *  @return {Object} A JSON-RPC 1.0 or 2.0 request
 *  @api public
 */
Utils.request = function(method, params, id, options) {
  if(typeof(method) !== 'string') {
    throw new TypeError(method + ' must be a string');
  }

  options = options || {};

  var request = {
    method: method
  };

  // assume that we are doing a 2.0 request unless specified differently
  if(typeof(options.version) === 'undefined' || options.version !== 1) {
    request.jsonrpc = '2.0';
  }

  if(params) {

    // params given, but invalid?
    if(typeof(params) !== 'object' && !Array.isArray(params)) {
      throw new TypeError(params + ' must be an object, array or omitted');
    }

    request.params = params;
  
  }

  // if id was left out, generate one (null means explicit notification)
  if(typeof(id) === 'undefined') {
    var generator = typeof(options.generator) === 'function' ? options.generator : Utils.generateId;
    request.id = generator(request, options);
  } else {
    request.id = id;
  }
  
  return request;
};

/**
 *  Generates a JSON-RPC 1.0 or 2.0 response
 *  @param {Object} error Error member
 *  @param {Object} result Result member
 *  @param {String|Number|null} id Id of request
 *  @param {Number} version JSON-RPC version to use
 *  @return {Object} A JSON-RPC 1.0 or 2.0 response
 *  @api public
 */
Utils.response = function(error, result, id, version) {
  id = typeof(id) === 'undefined' || id === null ? null : id;
  error = typeof(error) === 'undefined' || error === null ? null : error;
  version = typeof(version) === 'undefined' || version === null ? 2 : version;
  var response = (version === 2) ? { jsonrpc: "2.0", id: id } : { id: id };

  // errors are always included in version 1
  if(version === 1) response.error = error;

  // one or the other with precedence for errors
  if(error) response.error = error;
  else response.result = result;
  return response;
};

/**
 *  Generates a random UUID
 *  @return {String}
 *  @api public
 */
Utils.generateId = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
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

Utils.parseStream = function(stream, options, onRequest) {

  var result = JSONStream.parse();

  stream.pipe(result);

  result.on('data', function(data) {

    // apply reviver walk function to prevent stringify/parse again
    if(typeof(options.reviver) === 'function') {
      data = Utils.walk({'': data}, '', options.reviver);
    }

    onRequest(null, data);
  });

};

/**
 *  Helper to parse a stream and interpret it as JSON
 *  @param {Stream} stream node.js Stream instance
 *  @param {Function} [reviver] Optional reviver for JSON.parse
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
Utils.parseBody = function(stream, options, callback) {

  callback = _.once(callback);
  var data = '';

  stream.setEncoding('utf8');

  stream.on('data', function(str) {
    data += str;
  });

  stream.on('error', function(err) {
    callback(err);
  });

  stream.on('end', function() {
    utils.JSON.parse(data, options, function(err, request) {
      if(err) return callback(err);
      callback(null, request);
    });
  });

};

/**
 *  Returns a HTTP request listener bound to the server in the argument.
 *  @param {http.Server} self Instance of a HTTP server
 *  @param {JaysonServer} server Instance of JaysonServer (typically jayson.Server)
 *  @return {Function}
 *  @api private
 */
Utils.getHttpListener = function(self, server) {
  return function(req, res) {
    var options = self.options || {};

    //  405 method not allowed if not POST
    if(!Utils.isMethod(req, 'POST')) return respondError('Method not allowed', 405, { 'allow': 'POST' });

    // 415 unsupported media type if Content-Type is not correct
    if(!Utils.isContentType(req, 'application/json')) return respondError('Unsupported media type', 415);

    Utils.parseBody(req, options, function(err, request) {
      // parsing failed, 500 server error
      if(err) return respondError(err, 500);

      server.call(request, function(error, success) {
        var response = error || success;
        if(response) {
          utils.JSON.stringify(response, options, function(err, body) {
            if(err) return respondError(err, 400);

            var headers = {
              "Content-Length": Buffer.byteLength(body, options.encoding),
              "Content-Type": "application/json"
            };
            res.writeHead(200, headers);
            res.end(body);
          });
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
 *  Determines if a HTTP Request comes with a specific Content-Type
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
  var args = /^function .*?\((.+?)\)/.exec(body);
  if(!args) return [];
  var list = (args.pop() || '').split(',');
  return list.map(function(arg) { return arg.trim(); });
};

/** * @namespace */
Utils.JSON = {};

/**
 * Parses a JSON string and then invokes the given callback
 * @param {String} str The string to parse
 * @param {Object} options Object with options, possibly holding a "reviver" function
 * @return {void}
 * @api public
 */
Utils.JSON.parse = function(str, options, callback) {
  options = options || {};

  if(_.isFunction(options.reviver)) {
    var reviver = options.reviver;
  }

  try {
    var obj = JSON.parse.apply(JSON, _.compact([str, reviver]));
  } catch(err) {
    return callback(err);
  }

  callback(null, obj);
};

/**
 * Stringifies JSON and then invokes the given callback
 * @param {Object} obj The object to stringify
 * @param {Object} options Object with options, possibly holding a "replacer" function
 * @return {void}
 * @api public
 */
Utils.JSON.stringify = function(obj, options, callback) {
  options = options || {};

  if(_.isFunction(options.replacer)) {
    var replacer = options.replacer;
  }

  try {
    var str = JSON.stringify.apply(JSON, _.compact([obj, replacer]));
  } catch(err) {
    return callback(err);
  }

  callback(null, str);
};

/**
 * Recursively walk an object and apply a function on its members
 * @param {Object} holder The object to walk
 * @param {String} key The key to look at
 * @param {Function} fn The function to apply to members
 * @return {Object}
 * @api public
 */
Utils.walk = function(holder, key, fn) {
  var k, v, value = holder[key];
  if (value && typeof value === 'object') {
    for (k in value) {
      if (Object.prototype.hasOwnProperty.call(value, k)) {
        v = Utils.walk(value, k, fn);
        if (v !== undefined) {
          value[k] = v;
        } else {
          delete value[k];
        }
      }
    }
  }
  return fn.call(holder, key, value);
};

/** * @namespace */
Utils.Request = {};

/**
 * Determines if the passed request is a batch request
 * @param {Object} request The request
 * @return {Boolean}
 * @api public
 */
Utils.Request.isBatch = function(request) {
  return Array.isArray(request);
};

/**
 * Determines if the passed request is a notification request
 * @param {Object} request The request
 * @return {Boolean}
 * @api public
 */
Utils.Request.isNotification = function(request) {
  return Boolean(
    request
    && !Utils.Request.isBatch(request)
    && (typeof(request.id) === 'undefined'
         || request.id === null)
  );
};

/**
 * Determines if the passed request is a valid JSON-RPC 2.0 Request
 * @param {Object} request The request
 * @return {Boolean}
 * @api public
 */
Utils.Request.isValidVersionTwoRequest = function(request) {
  return Boolean(
    request
    && typeof(request) === 'object'
    && request.jsonrpc === '2.0'
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
};

/**
 * Determines if the passed request is a valid JSON-RPC 1.0 Request
 * @param {Object} request The request
 * @return {Boolean}
 * @api public
 */
Utils.Request.isValidVersionOneRequest = function(request) {
  return Boolean(
    request
    && typeof(request) === 'object'
    && typeof(request.method) === 'string'
    && Array.isArray(request.params)
    && typeof(request.id) !== 'undefined'
  );
};

/**
 * Determines if the passed request is a valid JSON-RPC Request
 * @param {Object} request The request
 * @param {Number} version JSON-RPC version 1 or 2
 * @return {Boolean}
 * @api public
 */
Utils.Request.isValidRequest = function(request, version) {
  version = version === 1 ? 1 : 2;
  return Boolean(
    request
    && (
      (version === 1 && Utils.Request.isValidVersionOneRequest(request)) ||
      (version === 2 && Utils.Request.isValidVersionTwoRequest(request))
    )
  );
};

/** * @namespace */
Utils.Response = {};

/**
 * Determines if the passed error is a valid JSON-RPC error response
 * @param {Object} error The error
 * @param {Number} version JSON-RPC version 1 or 2
 * @return {Boolean}
 * @api public
 */
Utils.Response.isValidError = function(error, version) {
  version = version === 1 ? 1 : 2;
  return Boolean(
    version === 1 && (
      typeof(error) !== 'undefined'
      && error !== null
    )
    || version === 2 && ( 
      error
      && typeof(error.code) === 'number'
      && parseInt(error.code) == error.code
      && typeof(error.message) === 'string'
    )
  );
};
