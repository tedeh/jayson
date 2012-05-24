var should = require('should');
var jayson = require(__dirname + '/..');

describe('jayson http', function() {

  var server = null;

  var methods = {
    add: function(a, b, callback) { callback(null, a + b); },
    error: function(callback) { callback(this.error(-1000, 'An error message')); }
  };

  describe('server', function() {

    it('should listen to a local port', function(done) {
      (function() {
        server = jayson.server(methods).http();
        server.listen(3000, 'localhost', done);
      }).should.not.throw();
    });

    it('should be an instance of http.Server', function() {
      server.should.be.instanceof(require('http').Server);
    });

  });

  describe('client', function() {
    
    var client = jayson.client.http({
      host: 'localhost',
      port: 3000
    });

    it('should be an instance of jayson.client', function() {
      client.should.be.instanceof(jayson.client);
    });

    it('should be able to request a method on the server', function(done) {
      var a = 11, b = 12;
      client.request('add', [a, b], function(err, error, result) {
        if(err || error) return next(err || error);
        should.exist(result);
        result.should.equal(a + b);
        done();
      });
    });

    it('should be able to receive an error from the server', function(done) {
      client.request('error', [], function(err, error, result) {
        if(err) return done(err);
        should.not.exist(result);
        should.exist(error, error.code, error.message);
        error.message.should.equal('An error message');
        error.code.should.equal(-1000);
        done();
      });
    });

  });

  after(function() {
    server.close();
  });

});
