var http = require('http');
var utils = require(__dirname + '/../utils');
var JaysonClient = require(__dirname + '/../client');

var JaysonHttpClient = module.exports = function(options) {
  if(!(this instanceof JaysonHttpClient)) return new JaysonHttpClient(options);
  JaysonClient.apply(this, arguments);
  this.options = this.options || {};
};
utils.inherits(JaysonHttpClient, JaysonClient);

JaysonHttpClient.prototype._request = function(request, callback) {
  try {
    var body = JSON.stringify(request);
  } catch(err) {
    return callback(err);
  }

  // copies options
  var options = utils.merge({}, this.options);

  options.method = options.method || "POST";
  options.headers = {
    "content-length": Buffer.byteLength(body, 'utf8'),
    "content-type": "application/json"
  };

  var req = http.request(options);

  req.on('response', function(res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) { data += chunk; });
    res.on('end', function() {
      // empty reply
      if(!data || typeof(data) !== 'string') return callback();

      try {
        var response = JSON.parse(data);
      } catch(err) {
        return callback(err);
      }
      callback(null, response);
    });
  });

  req.on('error', function(err) {
    callback(err);
    req.abort();
  });

  req.write(body);
  req.end();
};
