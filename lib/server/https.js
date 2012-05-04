var https = require('https');
var utils = require(__dirname + '/../utils');

var JaysonHttpsServer = module.exports = function(server, options) {
  if(!(this instanceof JaysonHttpsServer)) return new JaysonHttpsServer(server, options);
  var args = Array.prototype.slice.call(arguments, 1);
  https.Server.apply(this, args);
  this.on('request', utils.httpRequestWrapper(server, options));
};
utils.inherits(JaysonHttpsServer, https.Server);
