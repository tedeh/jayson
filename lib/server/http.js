var http = require('http');
var utils = require(__dirname + '/../utils');

var JaysonHttpServer = module.exports = function(server, options) {
  if(!(this instanceof JaysonHttpServer)) return new JaysonHttpServer(server);

  http.Server.call(this);

  this.on('request', function(req, res) {
    var options = utils.merge(server.options, options || {});

    //  405 method not allowed if not POST
    if(!utils.isMethod(req, 'POST')) return error(405, { 'allow': 'POST' });

    // 415 unsupported media type if content-type is not correct
    if(!utils.isContentType(req, 'application/json')) return error(415);

    utils.parseBody(req, options.reviver, function(err, request) {
      // parsing failed, 500 server error
      if(err) return error(500);

      server.call(request, function(error, success) {
        var response = error || success;
        utils.stringify(response, options.replacer, function(err, body) {
          // stringify failed, 500 server error
          if(err) return error(500);
          var headers = {
            "content-length": Buffer.byteLength(body, options.encoding),
            "content-type": "application/json"
          };
          res.writeHead(200, headers);
          res.write(body);
          res.end();
        });
      });

    });

    // ends the request with an error code
    function error(code, headers) {
      res.writeHead(code, headers || {});
      res.end();
    }

  });
};
utils.inherits(JaysonHttpServer, http.Server);
