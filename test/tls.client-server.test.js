'use strict';

const should = require('should');
const fs = require('fs');
const jayson = require('./..');
const support = require('./support');
const suites = require('./support/suites');
const JSONStream = require('JSONStream');
const tls = require('tls');

const serverOptions = {
  ca: [fs.readFileSync(__dirname + '/fixtures/keys/ca1-cert.pem')],
  key: fs.readFileSync(__dirname + '/fixtures/keys/agent1-key.pem'),
  cert: fs.readFileSync(__dirname + '/fixtures/keys/agent1-cert.pem'),
  requestCert: true,
  secureProtocol: 'TLSv1_2_method'
};

const clientOptions = {
  ca: serverOptions.ca,
  secureProtocol: serverOptions.secureProtocol,
  key: serverOptions.key,
  cert: serverOptions.cert,
  reviver: support.server.options().reviver,
  replacer: support.server.options().replacer,
  host: 'localhost',
  port: 3999
}

describe('jayson.tls', function() {

  describe('server', function() {

    let server = null;

    after(function() {
      server.close();
    });

    it('should listen to a local port', function(done) {
      server = jayson.server(support.methods, support.options).tls(serverOptions);
      server.listen(3999, 'localhost', done);
    });

    it('should be an instance of tls.Server', function() {
      server.should.be.instanceof(tls.Server);
    });

  });

  describe('client', function() {
    
    const server = jayson.server(support.server.methods(), support.server.options());
    const serverTls = server.tls(serverOptions);
    const client = jayson.client.tls(clientOptions);

    before(function(done) {
      serverTls.listen(3999, 'localhost', done);
    });

    after(function() {
      serverTls.close();
    });

    describe('common tests', suites.getCommonForClient(client));

    it('should send a parse error for invalid JSON data', function(done) {
      const socket = tls.connect(3999, 'localhost', serverOptions, function() {
        const response = JSONStream.parse();

        response.on('data', function(data) {
          data.should.containDeep({
            id: null,
            error: {code: -32700} // Parse Error
          });
          socket.end();
          done();
        });

        socket.pipe(response);

        // obviously invalid
        socket.write('abc');
      });
    });

    describe('options', function() {

      const serverIcp = server.tls(serverOptions);
      before(function(done) {
        serverIcp.listen('/tmp/test.sock', done);
      });

      after(function() {
        serverIcp.close();
      });

      it('should accept a string as the frist option for an IPC connection', function(done) {
        const client = jayson.client.tls('/tmp/test.sock');
        client.options.secureContext = tls.createSecureContext(clientOptions);
        client.request('add', [1, 2], function(err, error, result) {
          if(err || error) return done(err || error);
          should(result).equal(3);
          done();
        });
      });

    });

  });

});
