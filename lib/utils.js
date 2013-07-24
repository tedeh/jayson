var util = require('util');

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

  if(!params || (typeof(params) !== 'object' && !Array.isArray(params))) {
    throw new TypeError(params + ' must be an object or an array');
  }

  options = options || {};

  var request = {
    params: params,
    method: method
  };

  // assume that we are doing a 2.0 request unless specified differently
  if (typeof(options.version) === 'undefined' || options.version !== 1) request.jsonrpc = "2.0";

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

/**
 *  Helper to parse a stream and interpret it as JSON
 *  @param {Stream} stream node.js Stream instance
 *  @param {Function} [reviver] Optional reviver for JSON.parse
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
Utils.parseBody = function(stream, options, callback) {
  if(!callback && typeof(reviver) === 'function') {
    callback = reviver;
    reviver = null;
  }

  var data = '';
  var inEscape = false;
  var inQuotes = false;
  var depth = 0;
  var completed = false;
  stream.setEncoding('utf8');
  stream.on('data', function(chunk) {
      if (completed)
        return;
      data += chunk;
      for (var i = data.length - chunk.length; i < data.length; ++i) {
        switch (data[i]) {
        case '\\':
          if (!inEscape)
            inEscape = true;
          break;
        case '"':
          if (!inEscape)
            inQuotes = !inQuotes;
          break;
        case '[':
        case '{':
          if (!inEscape && !inQuotes)
            ++depth;
          break
        case ']':
        case '}':
          if (!inEscape && !inQuotes) {
            --depth;
            if (depth == 0) {
              completed = true;
              var slice = data.substring(0, i + 1);
              utils.JSON.parse(slice, options, function(err, message) {
                data = data.substring(i + 1);
                i = -1;
                if(err) return callback(err);
                callback(null, message);
              });
            }
          }
          break;
        }
        inEscape = false;
      }
  });
  stream.on('end', function() {
    if (depth != 0)
      callback(new SyntaxError('Unexpected end of input'));
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
 *  Returns a TCP connection listener bound to the server in the argument. "this" must be an instanceof jayson.Server.tcp
 *  @param {JaysonServer} server Instance of JaysonServer (typically jayson.Server)
 *  @return {Function}
 *  @api private
 */
Utils.tcpConnectionListenerWrapper = function(server) {
  var self = this;
  return function(conn) {
    var options = self.options || {};

    Utils.parseBody(conn, options, function(err, request) {
      // parsing failed
      if(err) return respondError(err);

      server.call(request, function(error, success) {
        var response = error || success;
        if(response) {
          utils.JSON.stringify(response, options, function(err, body) {
            if(err) return respondError(err);
            conn.write(body);
            conn.end();
          });
        } else {
          // no response received at all, must be a notification
          conn.end();
        }
      });
    });

    // ends the request with an error code
    function respondError(err) {
      var Server = require('./server');
      var error = server.error(Server.errors.PARSE_ERROR, null, String(err));
      var response = Utils.response(error, undefined, undefined, self.options.version);
      utils.JSON.stringify(response, options, function(err, body) {
        if(err) body = ''; // we tried our best.
        conn.end(body);
      });
    }

  };
}

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
  var reviver = options ? options.reviver : null;

  try {
    var obj = JSON.parse(str, reviver);
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
  var replacer = options ? options.replacer : null;

  try {
    var str = JSON.stringify(obj, replacer);
  } catch(err) {
    return callback(err);
  }

  callback(null, str);
};

// For quick access in classes
Utils.inherits = util.inherits;
