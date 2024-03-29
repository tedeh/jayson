'use strict';

const jayson = require('jayson');
const fs = require('fs');
const path = require('path');

// Read node's tls documentation for more information about these options:
// https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
const options = {
  key: fs.readFileSync(path.resolve('./../../test/fixtures/keys/agent1-key.pem')),
  cert: fs.readFileSync(path.resolve('./../../test/fixtures/keys/agent1-cert.pem')),
  requestCert: true,
  // This is necessary only if the client uses the self-signed certificate.
  ca: [ fs.readFileSync(path.resolve('./../../test/fixtures/keys/ca1-cert.pem')) ],
};

// create a server
const server = new jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

// Bind a tls interface to the server and let it listen to localhost:3000
server.tls(options).listen(3000);
