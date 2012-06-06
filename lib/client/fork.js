var utils = require('../utils');
var JaysonClient = require('./');
var JaysonForkServer = require('../').server.fork;

var JaysonForkClient = module.exports = function(options) {
  if(!(this instanceof JaysonForkClient)) return new JaysonForkClient(options);
  JaysonClient.apply(this, arguments);
  
  var defaults = utils.merge(this.options, {
    encoding: 'utf8',
    server: null
  });

  this.options = utils.merge(defaults, options || {});
};
utils.inherits(JaysonForkClient, JaysonClient);

JaysonForkClient.prototype._request = function(request, callback) {
  console.log('at request', request);
  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);
  options.server.call(request, callback);
};
