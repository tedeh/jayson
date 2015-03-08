var http = require('http');
var url = require('url');
var utils = require('../utils');
var Client = require('../client');

/**
 *  Constructor for a Jayson HTTP Client
 *  @class ClientHttp
 *  @constructor
 *  @extends Client
 *  @param {Object|String} [options] String interpreted as a URL
 *  @param {String} [options.encoding="utf8"] Encoding to use
 *  @return {ClientHttp}
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
require('util').inherits(HttpClient, Client);

module.exports = HttpClient;

HttpClient.prototype._request = function(request, callback) {
  var self = this;
  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);

  utils.JSON.stringify(request, options, function(err, body) {
    if(err) return callback(err);

    options.method = options.method || 'POST';

    var headers = {
      "Content-Length": Buffer.byteLength(body, options.encoding),
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    // let user override the headers
    options.headers = utils.merge(headers, options.headers || {});

    var req = self._getRequestStream(options);

    self.emit('http request', req);

    req.on('response', function(res) {
      self.emit('http response', res, req);

      res.setEncoding(options.encoding);

      var data = '';
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
          utils.JSON.parse(data, options, callback);
        }
      });

    });

    // abort on timeout
    req.on('timeout', function() {
      req.abort(); // req.abort causes "error" event
    });

    // abort on error
    req.on('error', function(err) {
      self.emit('http error', err);
      callback(err);
      req.abort();
    });

    req.end(body);
  });
};

/**
 *  Gets a stream interface to a http server
 *  @param {Object} options An options object
 *  @return {require('http').ClientRequest}
 *  @api private
 */
HttpClient.prototype._getRequestStream = function(options) {
  return http.request(options || {});
};
