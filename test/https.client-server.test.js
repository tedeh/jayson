var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support');
var suites = require(__dirname + '/support/suites');
var http = require('http');
var https = require('https');
var url = require('url');

describe('Jayson.Https', function() {

  describe('server', function() {

    var server = null;

    after(function() {
      if(server) server.close();
    });

    it('should listen to a local port', function(done) {
        server = jayson.server(support.methods, support.options).https(support.server.keys);
        server.listen(3000, 'localhost', done);
    });

    it('should be an instance of https.Server', function() {
      server.should.be.instanceof(https.Server);
    });

  });

  describe('client', function() {
    
    var server = jayson.server(support.server.methods, support.server.options);
    var https = server.https(support.server.keys);
    var client = jayson.client.https({
      reviver: support.server.options.reviver,
      replacer: support.server.options.replacer,
      host: 'localhost',
      port: 3000,
      ca: support.server.keys.ca
    });

    before(function(done) {
      https.listen(3000, 'localhost', done);
    });

    after(function() {
      https.close();
    });

    it('should accept a URL string as the first argument', function() {
      var urlStr = 'https://localhost:3000';
      var client = jayson.client.https(urlStr);
      var tokens = url.parse(urlStr);
      client.options.should.containDeep(tokens);
    });

    describe('common tests', suites.getCommonForClient(client));

    describe('common http client tests', suites.getCommonForHttpClient(client));

  });

});
