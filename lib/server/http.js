var http = require('http');
var utils = require(__dirname + '/../utils');
var middleware = require('./middleware');

var JaysonHttpServer = module.exports = function(server) {
  if(!(this instanceof JaysonHttpServer)) return new JaysonHttpServer(server);

  http.Server.call(this);

  this.on('request', function(req, res) {
    utils.parseBody(req, function(err, request) {
      req.body = request;
      var handler = middleware(server);
      handler(req, res, function(err) {
        // if internal error, just 500
        if(err) {
          res.writeHead(500);
          res.end();
        }
      });
    });
  });
};
utils.inherits(JaysonHttpServer, http.Server);
