var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');

describe('jayson http', function() {

  var server = null;

  describe('server', function() {

    it('should listen to a local port', function(done) {
      (function() {
        server = jayson.server(support.methods, support.options).http();
        server.listen(3000, 'localhost', done);
      }).should.not.throw();
    });

    it('should be an instance of http.Server', function() {
      server.should.be.instanceof(require('http').Server);
    });

  });

  describe('client', function() {
    
    var client = jayson.client.http({
      reviver: support.options.reviver,
      replacer: support.options.replacer,
      host: 'localhost',
      port: 3000
    });

    it('should be an instance of jayson.client', support.clientInstance(client));

    it('should be able to request a method on the server', support.clientRequest(client));

    it('should be able to request a method on the server', support.clientError(client));

    it('should support reviving and replacing', support.clientReviveReplace(client));

  });

  after(function() {
    server.close();
  });

});
