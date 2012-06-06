var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');

describe('jayson fork', function() {

  var server = null;

  describe('server', function() {

    it('should successfully fork', function(done) {
      (function() {
        server = jayson.server(support.methods, support.options).fork();
      }).should.not.throw();
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

    it('should be able to request a success-method on the server', support.clientRequest(client));

    it('should be able to request an error-method on the server', support.clientError(client));

    it('should support reviving and replacing', support.clientReviveReplace(client));

  });

  after(function() {
    server.close();
  });

});

describe('jayson forking server', function() {

  it('should support forking');

});
