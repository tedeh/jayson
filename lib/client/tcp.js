'use strict';

const net = require('net');
const url = require('url');
const utils = require('../utils');
const Client = require('../client');

/**
 *  Constructor for a Jayson TCP Client
 *  @class ClientTcp
 *  @constructor
 *  @extends Client
 *  @param {Object|String} [options] Optional hash of settings or a URL
 *  @return {ClientTcp}
 */
const ClientTcp = function(options) {
  // accept first parameter as a url string
  if(typeof(options) === 'string') {
    options = url.parse(options);
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

  utils.JSON.stringify(request, options, function(err, body) {
    if(err) {
      return callback(err);
    }

    let handled = false;

    const conn = net.connect(options, function() {

      conn.setEncoding(options.encoding);

      // wont get anything for notifications, just end here
      if(utils.Request.isNotification(request)) {

        handled = true;
        conn.end(body + delimiter);
        callback();

      } else {

        utils.parseStream(conn, options, function(err, response) {
          handled = true;
          conn.end();
          if(err) {
            return callback(err);
          }
          callback(null, response);
        });

        conn.write(body + delimiter);

      }

    });

    conn.on('error', function(err) {
      self.emit('tcp error', err);
      callback(err);
    });

    conn.on('end', function() {
      if(!handled) {
        callback();
      }
    });
  });
};
