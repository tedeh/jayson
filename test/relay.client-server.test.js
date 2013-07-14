var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');

describe('jayson relay', function() {

  describe('server', function() {

    it('should be created with a client as a method', function() {
      (function() {
        var server = jayson.server(support.methods, support.options);
        jayson.server({
          add: jayson.client(server)
        }, support.options);
      }).should.not.throw();
    });

  });

  describe('client', function() {

    var frontClient, relayClient, backServer, frontServer, context = {};

    beforeEach(function() {
      backServer = jayson.server(support.methods, support.options);
    });

    beforeEach(function() {
      relayClient = jayson.client(backServer, support.options);
    });

    beforeEach(function() {
      frontServer = jayson.server({}, support.options);

      // replace all methods in front server with the client
      Object.keys(backServer._methods).forEach(function(methodName) {
        frontServer.method(methodName, relayClient);
      });
    });

    beforeEach(function() {
      frontClient = context.client = jayson.client(frontServer, support.options);
    });

    it('should be able to request a success-method on the relayed server', support.clientRequest(context));

    it('should be able to request an error-method on the relayed server', support.clientError(context));

    it('should support reviving and replacing via the relays', support.clientReviveReplace(context));

    it('should be able to relay a notification', support.clientNotification(context));

    it('should be able to relay a batch request', support.clientBatch(context));

  });

});
