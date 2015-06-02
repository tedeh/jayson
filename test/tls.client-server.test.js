var should = require('should');
var fs = require('fs');
var jayson = require(__dirname + '/..');
var support = require('./support');
var common = support.common;
var JSONStream = require('jsonstream');
var tls = require('tls');

var serverOptions = {
  ca: [fs.readFileSync('./test/fixtures/keys/ca1-cert.pem')],
  key: fs.readFileSync('./test/fixtures/keys/agent1-key.pem'),
  requestCert: true,
  cert: fs.readFileSync('./test/fixtures/keys/agent1-cert.pem')
};

describe('Jayson.Tls', function() {

  describe('server', function() {

    var server = null;

    after(function() {
      server.close();
    });

    it('should listen to a local port', function(done) {
        server = jayson.server(support.methods, support.options).tls(serverOptions);
        server.listen(3000, 'localhost', done);
    });

    it('should be an instance of tls.Server', function() {
      server.should.be.instanceof(tls.Server);
    });

  });

  describe('client', function() {
    
    var server = jayson.server(support.server.methods, support.server.options);
    var server_tls = server.tls(serverOptions);
    var client = jayson.client.tls({
      reviver: support.server.options.reviver,
      replacer: support.server.options.replacer,
      host: 'localhost',
      port: 3000,
      ca: serverOptions.ca
    });

    before(function(done) {
      server_tls.listen(3000, 'localhost', done);
    });

    after(function() {
      server_tls.close();
    });

    describe('common tests', common(client));

    it('should send a parse error for invalid JSON data', function(done) {
      var socket = tls.connect(3000, 'localhost', serverOptions, function() {
        var response = JSONStream.parse();

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

  });

});
