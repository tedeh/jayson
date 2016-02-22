var should = require('should');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var suites = require(__dirname + '/support/suites');
var http = require('http');
var url = require('url');

describe('Jayson.Http', function() {

  var server = jayson.server(support.server.methods, support.server.options);
  var serverHttp = server.http();
  var client = jayson.client.http({
    reviver: support.server.options.reviver,
    replacer: support.server.options.replacer,
    host: 'localhost',
    port: 3000
  });

  before(function(done) {
    serverHttp.listen(3000, 'localhost', done);
  });

  after(function() {
    if(serverHttp) serverHttp.close();
  });

  describe('server', function() {

    it('should be an instance of http.Server', function() {
      serverHttp.should.be.instanceof(http.Server);
    });

    describe('common http server tests', suites.getCommonForHttpServer(server, client));

  });

  describe('client', function() {

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
