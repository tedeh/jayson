var should = require('should');
var jayson = require('./..');
var support = require('./support');
var suites = require('./support/suites');

describe('jayson.relay', function() {

  describe('server', function() {

    it('should be created with a client as a method without throwing', function() {
      var server = jayson.server(support.methods, support.server.options);
      (function () {
        jayson.server({add: jayson.client(server)}, support.server.options);
      }).should.not.throw();
    });

  });

  describe('client', function() {

    var options = support.server.options;

    var frontServer = jayson.server({}, options);
    var backServer = jayson.server(support.server.methods, options);
    var relayClient = jayson.client(backServer, options);
    var frontClient = jayson.client(frontServer, options);

    // replace all methods in front server with the client
    Object.keys(backServer._methods).forEach(function(name) {
      frontServer.method(name, relayClient);
    });

    describe('common tests', suites.getCommonForClient(frontClient));

  });

});
