'use strict';

const should = require('should');
const jayson = require('./..');
const support = require('./support');
const suites = require('./support/suites');

describe('jayson.relay', function() {

  describe('server', function() {

    it('should be created with a client as a method without throwing', function() {
      const server = jayson.server(support.methods, support.server.options());
      (function () {
        jayson.server({add: jayson.client(server)}, support.server.options());
      }).should.not.throw();
    });

  });

  describe('client', function() {

    const options = support.server.options();

    const frontServer = jayson.server({}, options);
    const backServer = jayson.server(support.server.methods(), options);
    const relayClient = jayson.client(backServer, options);
    const frontClient = jayson.client(frontServer, options);

    // replace all methods in front server with the client
    Object.keys(backServer._methods).forEach(function(name) {
      frontServer.method(name, relayClient);
    });

    describe('common tests', suites.getCommonForClient(frontClient));

  });

});
