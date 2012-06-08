var utils = require('../utils');

var JaysonMiddleware = module.exports = function(server, options) {
  return function(req, res, next) {
    var options = utils.merge(server.options, options || {});

    //  405 method not allowed if not POST
    if(!utils.isMethod(req, 'POST')) return error(405, { 'allow': 'POST' });

    // 415 unsupported media type if content-type is not correct
    if(!utils.isContentType(req, 'application/json')) return error(415);

    // body does not appear to be parsed, 500 server error
    if(!req.body || typeof(req.body) !== 'object') return next(new Error('Request body must be parsed'));

    server.call(req.body, function(error, success) {
      var response = error || success;

      var body = '';
      // stringifies JSON
      try { body = JSON.stringify(response, options.replacer); } catch(err) { return next(err); }

      var headers = {
        "content-length": Buffer.byteLength(body, options.encoding),
        "content-type": "application/json"
      };
      res.writeHead(200, headers);
      res.write(body);
      res.end();
    });

    // ends the request with an error code
    function error(code, headers) {
      res.writeHead(code, headers || {});
      res.end();
    }
  };
};
