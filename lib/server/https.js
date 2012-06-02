var https = require('https');
var utils = require('../utils');

var JaysonHttpsServer = module.exports = function(server, options) {
  if(!(this instanceof JaysonHttpsServer)) return new JaysonHttpsServer(server, options);
  https.Server.call(this, utils.httpRequestWrapper(server, options));
};
utils.inherits(JaysonHttpsServer, https.Server);
