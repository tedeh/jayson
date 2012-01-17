var utils = require(__dirname + '/../utils');

var JaysonMiddleware = module.exports = function(server) {
  return function(req, res, next) {
    var request = req.body;
    server.call(req.body, function(error, success) {
      var response = error || success;
      
      // is there even a response?
      if(response) {
        utils.stringify(response, null, function(err, str) {
          if(err) return next(err);
          respond(res, str);
        });
      } else {
        respond(res);
      }
    });
  };
};

function respond(res, body) {
  body = body || '';
  var headers = {
    "content-length": Buffer.byteLength(body, 'utf8'),
    "content-type": "application/json"
  };
  res.writeHead(200, headers);
  if(body) res.write(body);
  res.end();
}
