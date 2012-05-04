var http = require('http');
var utils = require(__dirname + '/../utils');

var JaysonHttpServer = module.exports = function(server, options) {
  if(!(this instanceof JaysonHttpServer)) return new JaysonHttpServer(server, options);
  http.Server.call(this, utils.httpRequestWrapper(server, options));
};
utils.inherits(JaysonHttpServer, http.Server);
