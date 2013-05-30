var http = require('http');
var url = require('url');
var utils = require('../utils');
var Client = require('../client');

/**
 *  Constructor for a Jayson HTTP Client
 *  @class Jayson JSON-RPC HTTP Client
 *  @constructor
 *  @extends Client
 *  @param {Object|String} [options] Optional hash of settings or a URL
 *  @return {HttpClient}
 *  @api public
 */
var HttpClient = function(options) {
  // accept first parameter as a url string
  if(typeof(options) === 'string') options = url.parse(options);

  if(!(this instanceof HttpClient)) return new HttpClient(options);
  Client.call(this, options);

  var defaults = utils.merge(this.options, {
    encoding: 'utf8'
  });

  this.options = utils.merge(defaults, options || {});
};
utils.inherits(HttpClient, Client);

module.exports = HttpClient;

HttpClient.prototype._request = function(request, callback) {
  var self = this;
  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);

  var body = '';
  // stringifies JSON
  try { body = JSON.stringify(request, options.replacer); } catch(err) { return callback(err); }

  options.method = options.method || 'POST';
  options.headers = utils.merge({
    "content-length": Buffer.byteLength(body, options.encoding),
    "content-type": "application/json",
    "accept": "application/json"
  }, options.headers || {});

  var req = http.request(options);

  req.on('response', function(res) {
    self.emit('http response', res);
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
    self.emit('http error', err);
    callback(err);
    req.abort();
  });

  req.end(body);
};
