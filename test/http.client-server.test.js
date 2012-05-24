var assert = require('assert');
var should = require('should');

var jayson = require(__dirname + '/..');

var serverMethods = {
  add: function(a, b, callback) { callback(null, a + b); },
  error: function(callback) {
    callback(this.error(-1000, 'An error message'));
  }
};

describe('The HTTP server', function() {
  var server = null;
  it('can be successfully set up to listen on localhost:3000', function(done) {
    (function() {
      server = jayson.server(serverMethods).http();
      server.listen(3000, done);
    }).should.not.throw();
  });

  after(function(done) {
    server.on('close', done);
    server.close();
  });
});

describe('A HTTP Server', function() {
  var server = null;
  before(function(done) {
    server = jayson.server(serverMethods).http();
    server.listen(3000, done);
  });

  describe('and a HTTP Client', function() {
    var client = jayson.client.http({ host: 'localhost', port: 3000 });
    it('should successfully be able to request "add" on the server', function(done) {
      client.request('add', [11, 12], function(err, error, response) {
        should.not.exist(err);
        should.not.exist(error);
        should.exist(response);
        response.should.be.a('number');
        response.should.equal(11 + 12);
        done();
      });
    });
    it('should successfully be able to receive a deliberate error from the server', function(done) {
      client.request('error', [], function(err, error, response) {
        should.not.exist(err);
        should.not.exist(response);
        should.exist(error, error.message, error.code);
        error.should.be.a('object');
        error.message.should.be.a('string').and.equal('An error message');
        error.code.should.be.a('number').and.equal(-1000);
        done();
      });
    });
  });

  after(function(done) {
    server.on('close', done);
    server.close();
  });
});
