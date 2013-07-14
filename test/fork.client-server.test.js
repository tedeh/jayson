var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');

describe('jayson fork', function() {

  describe('server', function() {

    it('constructor should return an instance without using "new"', function() {
      var instance = jayson.server.fork(__dirname + '/support/fork');
      instance.should.be.an.instanceof(jayson.server.fork);
    });

  });

  describe('client', function() {

    var server, client, context = {};

    beforeEach(function() {
      server = context.server = jayson.server.fork(__dirname + '/support/fork', support.options);
      client = context.client = jayson.client.fork(server, {
        reviver: support.options.reviver,
        replacer: support.options.replacer
      });
    });

    afterEach(function() {
      server.kill();
    });
    
    it('should be an instance of jayson.client', support.clientInstance(context));

    it('should be able to request a success-method on the server', support.clientRequest(context));

    it('should be able to request an error-method on the server', support.clientError(context));

    it('should support reviving and replacing', support.clientReviveReplace(context));

    it('should be able to handle a notification', support.clientNotification(context));

    it('should be able to handle a batch request', support.clientBatch(context));

  });

});
