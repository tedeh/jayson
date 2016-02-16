var should = require('should');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var suites = require(__dirname + '/support/suites');
var http = require('http');
var url = require('url');

describe('Jayson.Http', function() {

  describe('server', function() {

    var server = null;

    after(function() {
      if(server) server.close();
    });

    it('should listen to a local port', function(done) {
      server = jayson.server(support.server.methods, support.server.options).http();
      server.listen(3000, 'localhost', done);
    });

    it('should be an instance of http.Server', function() {
      server.should.be.instanceof(http.Server);
    });

  });

  describe('client', function() {

    var client = jayson.client.http({
      reviver: support.server.options.reviver,
      replacer: support.server.options.replacer,
      host: 'localhost',
      port: 3000
    });

    var server = jayson.server(support.server.methods, support.server.options);
    var server_http = server.http();

    before(function(done) {
      server_http.listen(3000, 'localhost', done);
    });

    after(function() {
      server_http.close();
    });

    it('should accept a URL string as the first argument', function() {
      var urlStr = 'http://localhost:3000';
      var client = jayson.client.http(urlStr);
      var tokens = url.parse(urlStr);
      client.options.should.containDeep(tokens);
    });

    describe('common tests', suites.getCommonForClient(client));

    describe('common http client tests', suites.getCommonForHttpClient(client));

  });

});
