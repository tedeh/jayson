var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');
var url = require('url');

describe('jayson tcp', function() {

  var server = null;

  describe('server', function() {

    it('should listen to a local port', function(done) {
      (function() {
        server = jayson.server(support.methods, support.options).tcp();
        server.listen(3000, 'localhost', done);
      }).should.not.throw();
    });

    it('should be an instance of net.Server', function() {
      server.should.be.instanceof(require('net').Server);
    });

  });

  describe('client', function() {
    
    var client = jayson.client.tcp({
      reviver: support.options.reviver,
      replacer: support.options.replacer,
      host: 'localhost',
      port: 3000
    });

    after(function() {
      server.close();
    });

    it('should be an instance of jayson.client', support.clientInstance(client));

    it('should be able to request a success-method on the server', support.clientRequest(client));

    it('should be able to request an error-method on the server', support.clientError(client));

    it('should support reviving and replacing', support.clientReviveReplace(client));

    it('should be able to handle a notification', support.clientNotification(client));

    it('should be able to handle a batch request', support.clientBatch(client));

  });

});
