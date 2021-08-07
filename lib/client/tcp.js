'use strict';

const net = require('net');
const utils = require('../utils');
const Client = require('../client');

/**
 *  Constructor for a Jayson TCP Client
 *  @class ClientTcp
 *  @constructor
 *  @extends Client
 *  @param {Object|String} [options] Object goes into options for net.connect, String goes into options.path. String option argument is NOT recommended.
 *  @return {ClientTcp}
 */
const ClientTcp = function(options) {
  if(typeof(options) === 'string') {
    options = {path: options};
  }

  if(!(this instanceof ClientTcp)) {
    return new ClientTcp(options);
  }
  Client.call(this, options);

  const defaults = utils.merge(this.options, {
    encoding: 'utf8'
  });

  this.options = utils.merge(defaults, options || {});
};
require('util').inherits(ClientTcp, Client);

module.exports = ClientTcp;

ClientTcp.prototype._request = function(request, callback) {
  const self = this;

  // copies options so object can be modified in this context
  const options = utils.merge({}, this.options);
  const delimiter = options.delimiter || '\n';

  self.pending_callbacks = self.pending_callbacks || [];
  self.conn = self.conn || null;

  utils.JSON.stringify(request, options, function(err, body) {
    if(err) {
      return callback(err);
    }

    if(self.conn) {
      if(utils.Request.isNotification(request)) {
        callback();
      }
      else {
        self.pending_callbacks.push(callback);
      }
      self.conn.write(body + delimiter);
    }
    else {
      self.conn = net.connect(options, function() {

        self.conn.setEncoding(options.encoding);

        // wont get anything for notifications, just end here
        if(utils.Request.isNotification(request)) {

          self.conn.write(body + delimiter);
          callback();

        } else {

          utils.parseStream(self.conn, options, function(err, response) {
            const cb = self.pending_callbacks.shift();
            if(err) {
              return cb(err);
            }
            cb(null, response);
          });

          self.pending_callbacks.push(callback);
          self.conn.write(body + delimiter);

        }

      });

      self.emit('tcp socket', self.conn);

      self.conn.on('error', function(err) {
        self.emit('tcp error', err);
        self.conn = null;
        
        while(self.pending_callbacks.length) {
          cb = self.pending_callbacks.shift();
          cb(err);
        }
      });

      self.conn.on('end', function() {
        self.conn = null;
        
        while(self.pending_callbacks.length) {
          cb = self.pending_callbacks.shift();
          cb();
        }
      });
    }
  });
};
