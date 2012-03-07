var should = require('should');

var jayson = require(__dirname + '/..');

var serverMethods = {
  add: function(a, b, callback) { callback(null, a + b); },
  divide: function(a, b, callback) { callback(null, a / b); },
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

  it('should be able to make a notification request', function(done) {
    client.request('add', [11, 9], null, function(err, response) {
      arguments.length.should.equal(0);
      should.not.exist(err, response);
      done();
    });
  });

  it('should successfully be able to request "divide" with named parameters', function(done) {
    var params = {b: 3, a: 12};
    client.request('divide', params, function(err, error, response) {
      should.not.exist(err, error);
      should.exist(response);
      response.should.be.a('number');
      response.should.equal(params.a / params.b);
      done();
    });
  });

  describe('and the "request" method', function() {
    it('should return a raw request if not passed a callback', function() {
      (function() {
        var params = [11, 9];
        var request = client.request('add', params);
        should.exist(request);
        request.should.be.a('object');
        request.should.have.property('method', 'add');
        request.should.have.property('id');
        request.should.have.property('params', params);
      }).should.not.throw();
    });
  });

  it('should successfully accept a simple batch request', function(done) {
    var batch = [
      client.request('add', [1, 1]),
      client.request('add', [-1, -1]),
      client.request('divide', [16, 4]),
    ];
    client.request(batch, function(err, response) {
      should.not.exist(err);
      should.exist(response);
      response.should.be.instanceof(Array);
      done();
    });
  });

  it('should provide a convenience method to the response in case of a batch request', function(done) {
    var batch = [
      client.request('add', [5, 10]),
      client.request('divide', [10, 10], 'lame_request_id'),
      client.request('does_not_exist', [])
    ];
    client.request(batch, function(err, response) {
      should.not.exist(err);
      should.exist(response);
      response.should.be.instanceof(Array);
      should.exist(response.id);
      response.id.should.be.a('function');
      should.exist(response.id(batch[0].id));
      response.id(batch[0].id).result.should.equal(15);
      response.id(batch[2].id).should.have.property('error');
      done();
    });
  });

  it('should return two arrays of errors and successes in a batch request if passed a suitable length callback', function(done) {
    var batch = [
      client.request('add', [5, 10]),
      client.request('divide', [0, 10], 'my_request_id'),
      client.request('does_not_exist', [])
    ];
    client.request(batch, function(err, errors, successes) {
      should.not.exist(err);
      should.exist(errors, successes);
      errors.should.be.instanceof(Array).and.have.length(1);
      successes.should.be.instanceof(Array).and.have.length(2);
      should.exist(errors.id, successes.id);
      successes.id.should.be.a('function');
      errors.id.should.be.a('function');
      should.exist(successes.id(batch[0].id));
      successes.id(batch[0].id).result.should.equal(15);
      should.exist(successes.id('my_request_id'));
      successes.id('my_request_id').result.should.equal(0);
      should.exist(errors.id(batch[2].id))
      errors.id(batch[2].id).should.have.property('error');
      done();
    });
  });

  it('should return nothing if fed a notification-only batch request', function(done) {
    var batch = [
      client.request('add', [5, 2], null),
      client.request('add', [7, 6], null)
    ];
    client.request(batch, function(err, response) {
      should.not.exist(err, response);
      done();
    });
  });

});
