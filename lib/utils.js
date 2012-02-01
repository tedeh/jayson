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

  if(typeof(params) !== 'object' || !Array.isArray(params)) {
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
 *  @api public
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

  try {
    var str = JSON.stringify(object, replacer);
  } catch(err) {
    return callback(err);
  }

  callback(null, str);
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

  if(typeof(str) !== 'string') {
    throw new TypeError(str + ' must be a String');
  }

  try {
    var object = JSON.parse(str, reviver);
  } catch(err) {
    return callback(err);
  }

  callback(null, object);
};

/**
 *  Determines if a HTTP Request comes with a specific content-type
 *  @param {ServerRequest} request
 *  @param {String} type
 *  @return {Boolean}
 *  @api public
 */
exports.isContentType = function(request, type) {
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
