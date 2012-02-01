var should = require('should');

var jayson = require(__dirname + '/..');

var serverMethods = {
  add: function(a, b, callback) { callback(null, a + b); },
  error: function(shouldError, callback) {
    if(shouldError) return callback(this.error(-1000, 'An error message'));
    callback();
  }
};

describe('A client', function() {
  var server = jayson.server(serverMethods);
  var client = jayson.client(server);

  it('should be an instance of the right object', function() {
    client.should.be.an.instanceof(jayson.client);
  });

  it('should successfully be able to request the "add"-method', function(done) {
    client.request('add', [5, 10], function(err, error, result) {
      should.not.exist(err);
      should.not.exist(error);
      should.exist(result);
      result.should.equal(5 + 10);
      done();
    });
  });

  it('should successfully be able to transmit errors', function(done) {
    client.request('error', [true], function(err, error, result) {
      should.not.exist(err);
      should.not.exist(result);
      should.exist(error, error.code, error.message);
      error.should.be.a('object');
      error.code.should.be.a('number').and.equal(-1000);
      error.message.should.be.a('string').and.equal('An error message');
      done();
    });
  });

  it('should return the response as-is to the callback if so specified', function(done) {
    client.request('add', [11, 9], function(err, response) {
      arguments.length.should.equal(2);
      should.not.exist(err);
      should.exist(response, response.result);
      response.result.should.equal(11 + 9);
      done();
    });
  });
});
