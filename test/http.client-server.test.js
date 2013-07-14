var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');
var ClientResponse = require('http').IncomingMessage;
var url = require('url');

describe('jayson http', function() {

  describe('server', function() {

    var server = null;

    it('should listen to a local port', function(done) {
      (function() {
        server = jayson.server(support.methods, support.options).http();
        server.listen(3000, 'localhost', done);
      }).should.not.throw();
    });

    it('should be an instance of http.Server', function() {
      server.should.be.instanceof(require('http').Server);
    });

    after(function() {
      if(server) server.close();
    });

  });

  describe('client', function() {
    
    var server, client, context = {};

    beforeEach(function(done) {
      server = context.server = jayson.server(support.methods, support.options).http();
      server.listen(3000, 'localhost', done);
    });

    beforeEach(function() {
      client = context.client = jayson.client.http({
        reviver: support.options.reviver,
        replacer: support.options.replacer,
        host: 'localhost',
        port: 3000
      });
    });

    afterEach(function() {
      if(server) server.close();
    });

    it('should be an instance of jayson.client', support.clientInstance(context));

    it('should be able to request a success-method on the server', support.clientRequest(context));

    it('should be able to request an error-method on the server', support.clientError(context));

    it('should support reviving and replacing', support.clientReviveReplace(context));

    it('should be able to handle a notification', support.clientNotification(context));

    it('should be able to handle a batch request', support.clientBatch(context));

    it('should emit an event with the http response', function(done) {
      client.on('http response', function(res) {
        should.exist(res);
        res.should.be.instanceof(ClientResponse);
        done();
      });
      client.request('add', [9, 4], function(err, response) {});
    });

    it('should accept a URL string as the first argument', function() {
      var urlStr = 'http://localhost:3000';
      var client = jayson.client.http(urlStr);
      var urlObj = url.parse(urlStr);
      Object.keys(urlObj).forEach(function(key) {
        client.options.should.have.property(key, urlObj[key]);
      });
    });

  });

});
