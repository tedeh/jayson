var should = require('should');
var _ = require('lodash');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var common = support.common;
var net = require('net');
var url = require('url');
var JSONStream = require('jsonstream');

describe('Jayson.Tcp', function() {

  describe('server', function() {

    var server = null;

    before(function() {
      server = jayson.server(support.server.methods, support.server.options).tcp();
    });

    after(function() {
      server.close();
    });

    it('should listen to a local port', function(done) {
      server.listen(3000, 'localhost', done);
    });

    it('should be an instance of net.Server', function() {
      server.should.be.instanceof(net.Server);
    });

    context('connected socket', function() {

      var socket = null;
      var responses = null;

      beforeEach(function(done) {
        server.listen(3000, 'localhost', done);
      });

      beforeEach(function(done) {
        socket = net.connect(3000, 'localhost', done);
        responses = JSONStream.parse();
        socket.pipe(responses);
      });

      afterEach(function(done) {
        socket.end();
        done();
      });

      it('should send a parse error for invalid JSON data', function(done) {
        responses.on('data', function(data) {
          data.should.containDeep({
            id: null,
            error: {code: -32700} // Parse Error
          });
          done();
        });

        // obviously invalid
        socket.end('abc');
      });

      it('should send more than one reply on the same socket', function(done) {
        var replies = [];
        responses.on('data', function(data) {
          replies.push(data);
        });

        // write raw requests to the socket
        socket.write(JSON.stringify(jayson.Utils.request('delay', [20])));
        socket.write(JSON.stringify(jayson.Utils.request('delay', [5])));

        setTimeout(function() {
          replies.should.have.lengthOf(2);
          replies[0].should.have.property('result', 5);
          replies[1].should.have.property('result', 20);
          done();
        }, 40);
      });
    
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

  });

});
