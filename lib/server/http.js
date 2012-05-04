var http = require('http');
var utils = require(__dirname + '/../utils');

var JaysonHttpServer = module.exports = function(server, options) {
  if(!(this instanceof JaysonHttpServer)) return new JaysonHttpServer(server, options);
  var args = Array.prototype.slice.call(arguments, 1);
  http.Server.apply(this, args);
  this.on('request', utils.httpRequestWrapper(server, options));
};
utils.inherits(JaysonHttpServer, http.Server);
