var utils = require(__dirname + '/utils');

var JaysonClient = module.exports = function(options) {
  if(!(this instanceof JaysonClient)) return new JaysonClient(options);

  var defaults = {
    reviver: null,
    replacer: null
  };

  this.options = utils.merge(defaults, options || {});
};

JaysonClient.http = require(__dirname + '/client/http');

JaysonClient.process = require(__dirname + '/client/process');

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

    // different invocations of callback depending on its length
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

/**
 *  Abstract method for subclassing
 */
JaysonClient._request = function(request, callback) {
  callback(new Error('method not implemented'));
};
