var utils = require('../utils');

/**
 * Creates a Connect/Express compatible middleware bound to a Server
 *  @class Jayson JSON-RPC Middleware
 *  @param {Server} server Server instance
 *  @param {Object} [options] Options for this function
 *  @return {Function}
 *  @api public
 */
var Middleware = function(server, options) {
  return function(req, res, next) {
    var optionsMerged = utils.merge(server.options, options || {});

    //  405 method not allowed if not POST
    if(!utils.isMethod(req, 'POST')) return error(405, { 'allow': 'POST' });

    // 415 unsupported media type if Content-Type is not correct
    if(!utils.isContentType(req, 'application/json')) return error(415);

    // body does not appear to be parsed, 500 server error
    if(!req.body || typeof(req.body) !== 'object') return next(new Error('Request body must be parsed'));

    server.call(req.body, function(error, success) {
      var response = error || success;

      utils.JSON.stringify(response, optionsMerged, function(err, body) {
        if(err) return next(err);

        // empty response?
        if(body) {
          var headers = {
            "Content-Length": Buffer.byteLength(body, optionsMerged.encoding),
            "Content-Type": "application/json"
          };
          res.writeHead(200, headers);
          res.write(body);
        } else {
          res.writeHead(204);
        }

        if(optionsMerged.shouldContinue) {
          next();
        } else {
          res.end();
        }

      });
    });

    // ends the request with an error code
    function error(code, headers) {
      res.writeHead(code, headers || {});
      res.end();
    }
  };
};

module.exports = Middleware;
