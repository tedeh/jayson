var should = require('should');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var common = support.common;
var net = require('net');
var url = require('url');
var JSONStream = require('JSONStream');
var jsonparse = require('jsonparse');

describe('Jayson.Tcp', function() {

  describe('server', function() {

    var server = null;

    it('should listen to a local port', function(done) {
      server = jayson.server(support.methods, support.options).tcp();
      server.listen(3000, 'localhost', done);
    });

    it('should be an instance of net.Server', function() {
      server.should.be.instanceof(net.Server);
    });

    after(function() {
      server.close();
    });

  });

  describe('client', function() {

    var server = jayson.server(support.server.methods, support.server.options);
    var server_tcp = server.tcp();
    var client = jayson.client.tcp({
      reviver: support.server.options.reviver,
      replacer: support.server.options.replacer,
      host: 'localhost',
      port: 3000
    });

    before(function(done) {
      server_tcp.listen(3000, 'localhost', done);
    });

    after(function() {
      server_tcp.close();
    });

    describe('common tests', common(client));

    it('should send a parse error for invalid JSON data', function(done) {
      var socket = net.connect(3000, 'localhost', function() {
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
        socket.end('abc');
      });
    });

  });

});
