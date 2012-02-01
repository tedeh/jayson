var Server = require(__dirname + '/server');
var utils = require(__dirname + '/utils');

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

JaysonClient.http = require(__dirname + '/client/http');

JaysonClient.prototype.request = function(method, params, id, callback) {
  if(typeof(id) === 'function') {
    callback = id;
    id = undefined; // specifically undefined because "null" is a notification request
  }

  try {
    var request = utils.request(method, params, id);
  } catch(err) {
    return callback(err);
  }

  this._request(request, function(err, response) {
    if(err) return callback(err);

    if(!response) return callback();

    // different invocations of passed callback depending on its length
    if(callback.length === 3) {
      if(response.error) {
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
