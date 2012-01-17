var utils = require(__dirname + '/utils');

var JaysonClient = module.exports = function(options) {
  if(!(this instanceof JaysonClient)) return new JaysonClient(options);
  this.options = options || {};
};

JaysonClient.http = require(__dirname + '/client/http');

JaysonClient.prototype.request = function(method, params, id, callback) {
  if(typeof(id) === 'function') {
    callback = id;
    id = undefined; // specifically undefined, not "null" which is a notification request
  }

  try {
    var request = utils.request(method, params, id);
  } catch(err) {
    return callback(err);
  }

  this._request(request, function(err, response) {
    if(err) return callback(err);

    if(!response) return callback();

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

//// Så här vill jag göra
//var jayson = require('json');
//
//var server = jayson.server({
//  add: function(a, b, callback) {
//    callback(null, a + b);
//  },
//  subtract: function(a, b, callback) {
//    if(a < 0 || b < 0) {
//      callback(this.errors.INVALID_PARAMS);
//    }
//    callback(null, a - b);
//  }
//});
//
//server.http().listen(3000);
//
//var client = jayson.client.http({
//  host: 'localhost',
//  port: 3000
//});
//
//// Låt applikationen generera id
//client.request('add', [5, 7], function(err, sum) {
//  console.log('sum is', sum);
//});
//
//// Ange ID själv
//client.request('add', [5, 7], 0xFF, function(err, sum) {
//  console.log('sum is', sum);
//});
//
//// Notification request
//client.request('add', [5, 7]);
//
//jayson.request.http({
//  host: 'localhost',
//  port: 3000
//}, 'add', [5, 7], function(err, sum) {
//  console.log(sum);
//});
