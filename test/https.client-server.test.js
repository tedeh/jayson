'use strict';

const should = require('should');
const jayson = require('./..');
const support = require('./support');
const suites = require('./support/suites');
const http = require('http');
const https = require('https');
const url = require('url');

describe('jayson.https', function() {

  describe('server', function() {

    let server = null;
    after(function() {
      if(server) server.close();
    });

    it('should listen to a local port', function(done) {
        server = jayson.server(support.methods, support.options).https(support.server.keys());
        server.listen(3999, 'localhost', done);
    });

    it('should be an instance of https.Server', function() {
      server.should.be.instanceof(https.Server);
    });

  });

  describe('client', function() {
    
    const server = jayson.server(support.server.methods(), support.server.options());
    const https = server.https(support.server.keys());
    const client = jayson.client.https({
      reviver: support.server.options().reviver,
      replacer: support.server.options().replacer,
      host: 'localhost',
      port: 3999,
      ca: support.server.keys().ca
    });

    before(function(done) {
      https.listen(3999, 'localhost', done);
    });

    after(function() {
      https.close();
    });

    it('should accept a URL string as the first argument', function() {
      const urlStr = 'https://localhost:3999';
      const client = jayson.client.https(urlStr);
      const tokens = url.parse(urlStr);
      client.options.should.containDeep(tokens);
    });

    describe('common tests', suites.getCommonForClient(client));

    describe('common http client tests', suites.getCommonForHttpClient(client));

  });

});
