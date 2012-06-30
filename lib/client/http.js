var http = require('http');
var utils = require('../utils');
var Client = require('./index');

/**
 *  Constructor for a Jayson HTTP Client
 *  @class Jayson JSON-RPC HTTP Client
 *  @extends Client
 *  @param {Object} [options] Optional hash of settings
 *  @return {HttpClient}
 *  @api public
 */
var HttpClient = function(options) {
  if(!(this instanceof HttpClient)) return new HttpClient(options);
  Client.apply(this, arguments);
  
  var defaults = utils.merge(this.options, {
    encoding: 'utf8'
  });

  this.options = utils.merge(defaults, options || {});
};
utils.inherits(HttpClient, Client);

module.exports = HttpClient;

HttpClient.prototype._request = function(request, callback) {
  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);

  var body = '';
  // stringifies JSON
  try { body = JSON.stringify(request, options.replacer); } catch(err) { return callback(err); }

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
      // assume we have an error
      if(res.statusCode < 200 || res.statusCode >= 300) {
        // assume the server gave the reason in the body
        var err = new Error(data);
        err.code = res.statusCode;
        callback(err);
      } else {
        // empty reply
        if(!data || typeof(data) !== 'string') return callback();

        try {
          var response = JSON.parse(data, options.reviver);
        } catch(exception) {
          return callback(exception);
        }
        callback(null, response);
      }
    });
  });

  req.on('error', function(err) {
    callback(err);
    req.abort();
  });

  req.end(body);
};
