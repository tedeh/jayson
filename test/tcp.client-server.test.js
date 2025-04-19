'use strict';

const should = require('should');
const jayson = require('./../');
const support = require('./support');
const suites = require('./support/suites');
const net = require('net');
const StreamValues = require('stream-json/streamers/StreamValues');

describe('jayson.tcp', function() {

  describe('server', function() {

    let server = null;
    before(function() {
      server = new jayson.server(support.server.methods(), support.server.options()).tcp();
    });

    after(function() {
      server.close();
    });

    it('should listen to a local port', function(done) {
      server.listen(3999, 'localhost', function() {
        server.close(done);
      });
    });

    it('should be an instance of net.Server', function() {
      server.should.be.instanceof(net.Server);
    });

    describe('connected socket', function() {

      let socket = null;
      let responses = null;

      before(function(done) {
        server.listen(3999, 'localhost', done);
      });

      beforeEach(function(done) {
        responses = StreamValues.withParser();
        socket = net.connect(3999, 'localhost', done);
        socket.pipe(responses);
      });

      afterEach(function(done) {
        socket.end();
        done();
      });

      it('should send a parse error for invalid JSON data', function(done) {
        responses.on('data', function(obj) {
          const data = obj.value;

          data.should.containDeep({
            id: null,
            error: {code: -32700} // Parse Error
          });
          done();
        });

        // obviously invalid data non-JSON data
        socket.write('abc');
        socket.end();
      });

      it('should send more than one reply on the same socket', function(done) {
        const replies = [];
        responses.on('data', function(obj) {
          const data = obj.value;

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

    const server = jayson.server(support.server.methods(), support.server.options());
    const serverTcp = server.tcp();
    const client = jayson.client.tcp({
      reviver: support.server.options().reviver,
      replacer: support.server.options().replacer,
      host: 'localhost',
      port: 3999,
      delimiter: '\r\n'
    });

    before(function(done) {
      serverTcp.listen(3999, 'localhost', done);
    });

    after(function() {
      serverTcp.close();
    });

    describe('common tests', suites.getCommonForClient(client));

    describe('options', function() {

      const serverIcp = server.tcp();
      before(function(done) {
        serverIcp.listen('/tmp/test.sock', done);
      });

      after(function() {
        serverIcp.close();
      });

      it('should accept a string as the first option for an IPC connection', function(done) {
        const client = jayson.client.tcp('/tmp/test.sock');
        client.request('add', [1, 2], function(err, error, result) {
          if(err || error) return done(err || error);
          should(result).equal(3);
          done();
        });
      });

    });

    describe('events', function () {

      describe('tcp socket', function () {

        it('should allow timeout to be manipulated by listening on tcp socket event', function (done) {
          let timeoutEventFired = false;

          client.on('tcp socket', function (socket) {
            socket.setTimeout(250, function () {
              timeoutEventFired = true;
              socket.end();
            });
          });

          server.method('triggerTimeout', function (args, callback) {
            setTimeout(function () {
              callback(null, true);
            }, args.timeout);
          });

          client.request('triggerTimeout', {timeout: 500}, function (err, result) {
            should(timeoutEventFired).equal(true);
            done();
          });

        });

      });

    });

  });

});
