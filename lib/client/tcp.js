var net = require('net');
var url = require('url');
var utils = require('../utils');
var Client = require('../client');

/**
 *  Constructor for a Jayson TCP Client
 *  @class Jayson JSON-RPC TCP Client
 *  @constructor
 *  @extends Client
 *  @param {Object|String} [options] Optional hash of settings or a URL
 *  @return {TcpClient}
 *  @api public
 */
var TcpClient = function(options) {
  // accept first parameter as a url string
  if(typeof(options) === 'string') options = url.parse(options);

  if(!(this instanceof TcpClient)) return new TcpClient(options);
  Client.call(this, options);

  var defaults = utils.merge(this.options, {
    encoding: 'utf8'
  });

  this.options = utils.merge(defaults, options || {});
};
utils.inherits(TcpClient, Client);

module.exports = TcpClient;

TcpClient.prototype._request = function(request, callback) {
  var self = this;
  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);

  utils.JSON.stringify(request, options, function(err, body) {
    if(err) return callback(err);

    var conn = net.connect(options);
    var handled = false;
    conn.setEncoding(options.encoding);
    utils.parseBody(conn, options, function(err, response) {
      handled = true;
      conn.end();
      if (err)
        return callback(err);
      callback(null, response);
    });

    conn.on('error', function(err) {
      self.emit('tcp error', err);
      callback(err);
    });

    conn.on('end', function() {
      if (!handled)
        callback();
    });

    conn.write(body);
  });
};
