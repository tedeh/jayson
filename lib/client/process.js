var utils = require(__dirname + '/../utils');
var JaysonClient = require(__dirname + '/../client');

var JaysonProcessClient = module.exports = function(server, options) {
  if(!(this instanceof JaysonProcessClient)) return new JaysonProcessClient(server, options);
  JaysonClient.apply(this, arguments);
  this.server = server;
};
utils.inherits(JaysonProcessClient, JaysonClient);

JaysonProcessClient.prototype._request = function(request, callback) {
  this.server.call(request, function(error, success) {
    var response = error || success;
    callback(null, response);
  });
};
