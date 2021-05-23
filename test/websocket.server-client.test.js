'use strict';

const should = require('should');
const jayson = require('./../');
const support = require('./support');
const suites = require('./support/suites');
const WebSocket = require('isomorphic-ws');

describe('jayson.websocket', function() {

  describe('server', function() {

    let server, serverWebsocket;
    before(function() {
      server = jayson.server(support.server.methods(), support.server.options());
      serverWebsocket = server.websocket({port: 3999});
    });

    it('should be an instance of WebSocket.Server', function () {
      should(serverWebsocket).be.an.instanceof(WebSocket.Server);
    });

    after(function() {
      serverWebsocket.close();
    });

  });

  describe('client', function() {

    let client, server, serverWebsocket;
    before(function (done) {
      server = new jayson.server(support.server.methods(), support.server.options());
      serverWebsocket = server.websocket({port: 3999});
      client = jayson.client.websocket({
        url: 'ws://localhost:3999',
        reviver: support.server.options().reviver,
        replacer: support.server.options().replacer,
      });
      client.ws.on('open', done);
    });

    after(function() {
      client.ws.close();
      serverWebsocket.close();
    });

    describe('common tests', suites.getCommonForClient(() => client, {
      getClient: true,
    }));

    describe('timeout', function () {

      it('should timeout of timeout in options', function (done) {
        client.options.timeout = 5;
        client.request('add_slow', [1, 2, true], function (err, result) {
          should(err).be.ok();
          should(err).have.property('message', 'timeout reached after 5 ms');
          done();
        });
      });

      it('should have zero outstanding requests', function () {
        should(client).have.property('outstandingRequests').eql([]);
      });

    });

  });

});
