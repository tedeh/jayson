var utils = require('../utils');
var JaysonClient = require('./');
var JaysonServer = require('../').Server;

var JaysonForkClient = module.exports = function(server, options) {
  if(!(this instanceof JaysonForkClient)) return new JaysonForkClient(server, options);
  JaysonClient.apply(this, arguments);
  
  var defaults = utils.merge(this.options, {
    encoding: 'utf8'
  });

  this.options = utils.merge(defaults, options || {});
};
utils.inherits(JaysonForkClient, JaysonClient);

JaysonForkClient.prototype._request = function(request, callback) {
  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);
  this.server.call(request, callback);
};
