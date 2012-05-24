var http = require('http');
var utils = require(__dirname + '/../utils');
var JaysonClient = require(__dirname + '/../client');

var JaysonHttpClient = module.exports = function(options) {
  if(!(this instanceof JaysonHttpClient)) return new JaysonHttpClient(options);
  JaysonClient.apply(this, arguments);
  
  var defaults = utils.merge(this.options, {
    encoding: 'utf8'
  });

  this.options = utils.merge(defaults, options || {});
};
utils.inherits(JaysonHttpClient, JaysonClient);

JaysonHttpClient.prototype._request = function(request, callback) {
  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);

  utils.stringify(request, options.replacer, function(err, body) {
    if(err) return callback(err);

    options.method = 'POST';
    options.headers = {
      "content-length": Buffer.byteLength(body, options.encoding),
      "content-type": "application/json",
      "accept": "application/json"
    };

    var req = http.request(options);

    req.on('response', function(res) {
      var data = '';
      res.setEncoding(options.encoding);
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        // empty reply
        if(!data || typeof(data) !== 'string') return callback();

        try {
          var response = JSON.parse(data, options.reviver);
        } catch(exception) {
          return callback(exception);
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
  });
};
