var tls = require('tls');
var utils = require('../utils');

/**
 *  Constructor for a Jayson TLS-encrypted TCP server
 *  @class ServerTls
 *  @extends require('tls').Server
 *  @param {Server} server Server instance
 *  @param {Object} [options] Options for this instance
 *  @return {ServerTls}
 */
var TlsServer = function(server, options) {
  if(!(this instanceof TlsServer)) return new TlsServer(server, options);

  this.options = utils.merge(server.options, options || {});

  tls.Server.call(this, this.options, getTlsListener(this, server));
};
require('util').inherits(TlsServer, tls.Server);

module.exports = TlsServer;

/**
 *  Returns a TLS-encrypted TCP connection listener bound to the server in the argument.
 *  @param {Server} server Instance of JaysonServer
 *  @param {tls.Server} self Instance of tls.Server
 *  @return {Function}
 *  @private
 *  @ignore
 */
function getTlsListener(self, server) {
  return function(conn) {
    var options = self.options || {};

    utils.parseStream(conn, options, function(err, request) {
      if(err) return respondError(err);

      server.call(request, function(error, success) {
        var response = error || success;
        if(response) {
          utils.JSON.stringify(response, options, function(err, body) {
            if(err) return respondError(err);
            conn.write(body);
          });
        } else {
          // no response received at all, must be a notification
        }
      });
    });

    // ends the request with an error code
    function respondError(err) {
      var Server = require(__dirname + '/../server');
      var error = server.error(Server.errors.PARSE_ERROR, null, String(err));
      var response = utils.response(error, undefined, undefined, self.options.version);
      utils.JSON.stringify(response, options, function(err, body) {
        if(err) body = ''; // we tried our best.
        conn.end(body);
      });
    }

  };
}
