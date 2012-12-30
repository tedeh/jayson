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

    var back = jayson.server(support.methods, support.options);
    var client = jayson.client(back, support.options);
    var front = jayson.server(support.methods, support.options);
    // replace all methods in front server with the client
    for(var name in front._methods) front.method(name, client);

    it('should be able to request a success-method on the relayed server', support.clientRequest(client));

    it('should be able to request an error-method on the relayed server', support.clientError(client));

    it('should support reviving and replacing via the relays', support.clientReviveReplace(client));

    it('should be able to relay a notification', support.clientNotification(client));

    it('should be able to relay a batch request', support.clientBatch(client));

  });

});
