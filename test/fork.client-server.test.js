var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');

describe('jayson fork', function() {

  describe('server', function() {

    describe('constructor', function() {

      it('should return an instance without using "new"', function() {

        var instance = jayson.server.fork(__dirname + '/support/fork');
        instance.should.be.an.instanceof(jayson.server.fork);
      });

    });

  });

  describe('client', function() {

    var server = jayson.server.fork(__dirname + '/support/fork', support.options);

    var client = jayson.client.fork(server, {
      reviver: support.options.reviver,
      replacer: support.options.replacer
    });
    
    it('should be an instance of jayson.client', support.clientInstance(client));

    it('should be able to request a success-method on the server', support.clientRequest(client));

    it('should be able to request an error-method on the server', support.clientError(client));

    it('should support reviving and replacing', support.clientReviveReplace(client));

    it('should be able to handle a notification', support.clientNotification(client));

    it('should be able to handle a batch request', support.clientBatch(client));

    after(function() {
      server.kill();
    });

  });

});
