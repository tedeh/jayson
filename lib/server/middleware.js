var utils = require(__dirname + '/../utils');

var JaysonMiddleware = module.exports = function(server) {
  return function(req, res, next) {
    
    //  405 method not allowed if not POST
    if(!utils.isMethod(req, 'POST')) return error(405, { 'allow': 'POST' });

    // 415 unsupported media type if content-type is not correct
    if(!utils.isContentType(req, 'application/json')) return error(415);

    // body does not appear to be parsed, 500 server error
    if(!req.body || typeof(req.body) !== 'object') return next('Body not parsed');

    server.call(req.body, function(error, success) {
      var response = error || success;
      utils.stringify(response, server.options.replacer, function(err, body) {
        // stringify failed, 500 server error
        if(err) return next(err);
        var headers = {
          "content-length": Buffer.byteLength(body, 'utf8'),
          "content-type": "application/json"
        };
        res.writeHead(200, headers);
        res.write(body);
        res.end();
      });
    });

    // ends the request with an error code
    function error(code, headers) {
      res.writeHead(code, headers || {});
      res.end();
    }
  };
};
