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

  // no id passed, generate one
  if(typeof(id) === 'undefined') {
    id = exports.generateId();
  }
  
  return {
    jsonrpc: "2.0",
    id: id || null,
    params: params,
    method: method
  };
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
  // one or the other
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
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
exports.parseBody = function(req, callback) {
  var data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { data += chunk; });
  req.on('end', function() {
    try {
      var request = JSON.parse(data);
    } catch(err) {
      return callback(err);
    }
    callback(null, request);
  });
};

/**
 *  Helper to stringify a JavaScript object into JSON
 *  @param {Object} object
 *  @param {Object} options
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
exports.stringify = function(object, options, callback) {
  if(typeof(options) === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  try {
    var replacer = options.replacer || undefined;
    var str = JSON.stringify(object, replacer);
  } catch(err) {
    return callback(err);
  }

  callback(null, str);
};

/**
 *  Helper to parse a string into JSON
 *  @param {String} str
 *  @param {Object} options
 *  @param {Function} callback
 *  @return {void}
 *  @api public
 */
exports.parse = function(str, options, callback) {
  if(typeof(options) === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  if(typeof(str) !== 'string') {
    throw new TypeError(str + ' must be a String');
  }

  try {
    var reviver = options.reviver || undefined;
    var object = JSON.parse(str, reviver);
  } catch(err) {
    return callback(err);
  }

  callback(null, object);
};

exports.inherits = util.inherits;
