var should = require('should');
var jayson = require(__dirname + '/..');

describe('A Jayson relay server', function() {

  var serverBack = jayson.server({
    add: function(a, b, callback) {
      return callback(null, a + b);
    }
  });

  var serverFront = null;

  it('should be created succesfully', function() {
    var client = jayson.client(serverBack);
    (function() {
      serverFront = jayson.server({ add: client });
    }).should.not.throw();
    should.exist(serverFront);
    serverFront.should.not.equal(null);
    serverFront.hasMethod('add').should.equal(true);
    serverFront.removeMethod('add');
    serverFront.hasMethod('add').should.equal(false);
    (function() {
      serverFront.method('add', client);
    }).should.not.throw();
    serverFront.hasMethod('add').should.equal(true);
  });

  it('should be able to relay a simple request', function(done) {
    var client = null;
    (function() {
      client = jayson.client(serverFront);
    }).should.not.throw();
    client.request('add', [1, 2], function(err, error, response) {
      should.not.exist(err, error);
      should.exist(response);
      response.should.equal(3);
      done();
    });
  });

  it('should be able to relay an RPC error', function(done) {
    var client = null;
    (function() {
      client = jayson.client(serverFront);
    }).should.not.throw();
    client.request('subtract', [1, 2], function(err, error, response) {
      should.not.exist(err, response);
      should.exist(error, error.code);
      error.code.should.equal(jayson.server.errors.METHOD_NOT_FOUND);
      done();
    });
  });

  it('should be able to handle a notification', function(done) {
    var client = jayson.client(serverFront);
    client.request('add', [1, 2], function(err, something) {
      should.not.exist(err, something);
      done();
    });
  });

  it('should be able to handle a batch request', function(done) {
    var client = jayson.client(serverFront);
    client.request([
      client.request('add', [4, 9]),
      client.request('add', [10, 22])
    ], function(err, responses) {
      should.not.exist(err);
      should.exist(responses);
      responses.should.be.instanceof(Array);
      responses.should.have.length(2);
      should.exist(responses[0], responses[0].result, responses[1], responses[1].result);
      responses[0].result.should.equal(4 + 9);
      responses[1].result.should.equal(10 + 22);
      done();
    });

  });
});
