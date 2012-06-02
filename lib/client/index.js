var Server = require('../server');
var utils = require('../utils');

var JaysonClient = module.exports = function(server, options) {
  if(!(server instanceof Server) && arguments.length === 1) {
    options = server;
    server = null;
  }
  if(!(this instanceof JaysonClient)) return new JaysonClient(server, options);

  var defaults = {
    reviver: null,
    replacer: null
  };

  this.options = utils.merge(defaults, options || {});

  if(server) this.server = server;
};

JaysonClient.http = require('./http');

JaysonClient.fork = require('./fork');

JaysonClient.prototype.request = function(method, params, id, callback) {
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
        var errors = response.filter(function(res) { return res.error; });
        var successes = response.filter(function(res) { return res.hasOwnProperty('result'); });
        errors.id = findById.bind(errors);
        successes.id = findById.bind(successes);
        callback(null, errors, successes);
      } else if(response.error) {
        callback(null, response.error);
      } else {
        callback(null, null, response.result);
      }
    } else {
      callback(null, response);
    }
  });
};

JaysonClient.prototype._request = function(request, callback) {
  this.server.call(request, function(error, success) {
    var response = error || success;
    callback(null, response);
  });
};

// finds a response in an array by id
function findById(id, map) {
  return this.filter(function(response) {
    return response && response.id != null && response.id === id;
  }).pop();
}
