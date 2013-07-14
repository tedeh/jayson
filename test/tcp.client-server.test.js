var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');
var net = require('net');
var url = require('url');

describe('jayson tcp', function() {

  describe('server', function() {

    var server = null;

    it('should listen to a local port', function(done) {
      (function() {
        server = jayson.server(support.methods, support.options).tcp();
        server.listen(3000, 'localhost', done);
      }).should.not.throw();
    });

    it('should be an instance of net.Server', function() {
      server.should.be.instanceof(require('net').Server);
    });

    after(function() {
      if(server) server.close();
    });

  });

  describe('client', function() {

    var server, client, context = {};

    beforeEach(function(done) {
      server = context.server = jayson.server(support.methods, support.options).tcp();
      server.listen(3000, 'localhost', done);
    });

    beforeEach(function() {
      client = context.client = jayson.client.tcp({
        reviver: support.options.reviver,
        replacer: support.options.replacer,
        host: 'localhost',
        port: 3000
      });
    });

    afterEach(function() {
      if(server) server.close();
    });

    it('should be an instance of jayson.client', support.clientInstance(context));

    it('should be able to request a success-method on the server', support.clientRequest(context));

    it('should be able to request an error-method on the server', support.clientError(context));

    it('should support reviving and replacing', support.clientReviveReplace(context));

    it('should be able to handle a notification', support.clientNotification(context));

    it('should be able to handle a batch request', support.clientBatch(context));

  });

});
