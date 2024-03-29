'use strict';

const jayson = require('jayson');
const fs = require('fs');
const path = require('path');

// Read node's tls documentation for more information about these options:
// https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
const options = {
  key: fs.readFileSync(path.resolve('./../../test/fixtures/keys/agent1-key.pem')),
  cert: fs.readFileSync(path.resolve('./../../test/fixtures/keys/agent1-cert.pem')),

  // This is necessary only if the client uses the self-signed certificate.
  ca: [ fs.readFileSync(path.resolve('./../../test/fixtures/keys/ca1-cert.pem')) ],
  port: 3000,
  host: 'localhost'
};

// create a client
const client = new jayson.client.tls(options);

// invoke "add"
client.request('add', [1, 1], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 2
});
