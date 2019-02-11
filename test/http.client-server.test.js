'use strict';

const should = require('should');
const jayson = require('./../');
const support = require('./support');
const suites = require('./support/suites');
const http = require('http');
const url = require('url');

describe('jayson.http', function() {

  const server = jayson.server(support.server.methods(), support.server.options());
  const serverHttp = server.http();
  const client = jayson.client.http({
    reviver: support.server.options().reviver,
    replacer: support.server.options().replacer,
    host: 'localhost',
    port: 3999
  });

  before(function(done) {
    serverHttp.listen(3999, 'localhost', done);
  });

  after(function() {
    if(serverHttp) serverHttp.close();
  });

  describe('server', function() {

    it('should be an instance of http.Server', function() {
      serverHttp.should.be.instanceof(http.Server);
    });

    describe('common http server tests', suites.getCommonForHttpServer(server, client));

    it('should not crash when given invalid JSON', function(done) {
      const reqOptions = {
        hostname: 'localhost',
        port: 3999,
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      };
      const req = http.request(reqOptions);
      req.end('invalid json', 'utf8');
      req.on('response', function(res) {
        let body = '';
        res.on('data', function(chunk) { body += chunk; });
        res.on('end', function() {
          res.statusCode.should.equal(400)
          done();
        });
      });
    });

  });

  describe('client', function() {

    it('should accept a URL string as the first argument', function() {
      const urlStr = 'http://localhost:3999';
      const client = jayson.client.http(urlStr);
      const tokens = url.parse(urlStr);
      client.options.should.containDeep(tokens);
    });

    describe('common tests', suites.getCommonForClient(client));

    describe('common http client tests', suites.getCommonForHttpClient(client));

  });

});
