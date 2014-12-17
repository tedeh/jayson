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

  this._outstandingRequests = {};

  this.options = utils.merge(defaults, options || {});
};
require('util').inherits(TcpClient, Client);

module.exports = TcpClient;

TcpClient.prototype._request = function(request, callback) {
  if (this.options.version === 1) {
    this._keepConnectionRequest(request, callback);
  }
  else {
    this._closeConnectionRequest(request, callback);
  }
};

TcpClient.prototype._closeConnectionRequest = function(request, callback) {
  var self = this;

  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);
  var isNotification = typeof(request.id) === 'undefined' || request.id === null;

  utils.JSON.stringify(request, options, function(err, body) {
    if(err) return callback(err);

    var handled = false;

    var conn = net.connect(options, function() {

      conn.setEncoding(options.encoding);

      // wont get anything for notifications, just end here
      if(utils.Request.isNotification(request)) {

        handled = true;
        conn.end(body);
        callback();

      } else {

        utils.parseStream(conn, options, function(err, response) {
          handled = true;
          conn.end();
          if(err) return callback(err);
          callback(null, response);
        });

        conn.write(body);
      
      }

    });

    conn.on('error', function(err) {
      self.emit('tcp error', err);
      callback(err);
    });

    conn.on('end', function() {
      if(!handled) callback(); 
    });
  });
};

TcpClient.prototype._keepConnectionRequest = function(request, callback) {
  var self = this;

  // copies options so object can be modified in this context
  var options = utils.merge({}, this.options);

  function setupConnection() {
    self.conn = net.connect(options, function() {
      self.connected = true;
    });
    self.conn.setEncoding(options.encoding);
    utils.parseStream(self.conn, options, self._handleIncoming.bind(self));

    self.conn.on('error', function(err) {
      self.emit('tcp error', err);
      self._finishOutstanding(err);
    });

    self.conn.on('end', function() {
      self._finishOutstanding();
    });
  }

  function write(data) {
    if (!self.conn) {
      setupConnection();
    }

    if (self.connected) {
      self.conn.write(data);
    }
    else {
      self.conn.on('connect', function() {
        self.conn.write(data);
      });
    }
  }

  utils.JSON.stringify(request, options, function(err, body) {
    if(err) return callback(err);

    // wont get anything for notifications, just end here
    if(utils.Request.isNotification(request)) {
      callback();
    } else {
      self._outstandingRequests[request.id] = callback;
      write(body);
    }
  });
};

TcpClient.prototype._handleIncoming = function(err, msg) {
  if (err) {
    // We couldn't parse the incoming request, according to JSON-RPC 1 we
    // should then close the connection
    return this.conn.end();
  }
  if (utils.Request.isNotification(msg)) {
    return this.notify(msg);
  }

  if (msg.id in this._outstandingRequests) {
    var callback = this._outstandingRequests[msg.id];
    delete this._outstandingRequests[msg.id];
    return callback(null, msg);
  }

  // If we fall through here it means we got a response without an outstanding
  // request, which is an error, thus we close the connection as per the
  // JSON-RPC 1 spec
  this.conn.end();
};

TcpClient.prototype._finishOutstanding = function(err) {
  for (var id in this._outstandingRequests) {
    var callback = this._outstandingRequests[id];
    callback(err);
  }

  this._outstandingRequests = {};
};
