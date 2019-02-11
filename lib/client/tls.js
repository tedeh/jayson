'use strict';

const tls = require('tls');
const url = require('url');
const utils = require('../utils');
const Client = require('../client');

/**
 *  Constructor for a Jayson TLS-encrypted TCP Client
 *  @class ClientTls
 *  @constructor
 *  @extends Client
 *  @param {Object|String} [options] Optional hash of settings or a URL
 *  @return {ClientTls}
 */
const ClientTls = function(options) {
  // accept first parameter as a url string
  if(typeof(options) === 'string') {
    options = url.parse(options);
  }

  if(!(this instanceof ClientTls)) {
    return new ClientTls(options);
  }
  Client.call(this, options);

  const defaults = utils.merge(this.options, {
    encoding: 'utf8'
  });

  this.options = utils.merge(defaults, options || {});
};
require('util').inherits(ClientTls, Client);

module.exports = ClientTls;

ClientTls.prototype._request = function(request, callback) {
  const self = this;

  // copies options so object can be modified in this context
  const options = utils.merge({}, this.options);

  utils.JSON.stringify(request, options, function(err, body) {
    if(err) {
      return callback(err);
    }

    let handled = false;

    const conn = tls.connect(options, function() {

      conn.setEncoding(options.encoding);

      // wont get anything for notifications, just end here
      if(utils.Request.isNotification(request)) {

        handled = true;
        conn.end(body + '\n');
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

        conn.write(body + '\n');
      
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
