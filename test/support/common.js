var should = require('should');
var support = require(__dirname);
var jayson = require(__dirname + '/../../');
var Counter = support.Counter;

/**
 * Get a mocha suite for common test cases
 * @param {Client} Client instance to use
 * @return {Function}
 */
var common = module.exports = function(client) {

  return function() {

    it('should be an instance of jayson.client', common.clientInstance(client));

    it('should be able to request a success-method on the server', common.clientRequest(client));

    it('should be able to request an error-method on the server', common.clientError(client));

    it('should support reviving and replacing', common.clientReviveReplace(client));

    it('should be able to handle a notification', common.clientNotification(client));

    it('should be able to handle a batch request', common.clientBatch(client));

  };
};

common.clientInstance = function(client) {
  return function() {
    client.should.be.instanceof(jayson.client);
  };
};

common.clientRequest = function(client) {
  return function(done) {
    var a = 11, b = 12;
    client.request('add', [a, b], function(err, error, result) {
      if(err || error) return done(err || error);
      should.exist(result);
      result.should.equal(a + b);
      done();
    });
  };
};

common.clientError = function(client) {
  return function(done) {
    client.request('error', [], function(err, error, result) {
      should.not.exist(err);
      should.not.exist(result);
      should.exist(error);
      error.should.have.property('message', 'An error message');
      error.should.have.property('code', -1000);
      done();
    });
  };
};

common.clientReviveReplace = function(client) {
  return function(done) {
    var a = 2, b = 1;
    var instance = new Counter(a);
    client.request('incrementCounterBy', [instance, b], function(err, error, result) {
      should.not.exist(err);
      should.not.exist(error);
      should.exist(result);
      result.should.be.instanceof(Counter).and.not.equal(instance, 'not the same object');
      result.should.have.property('count', a + b);
      done();
    });
  };
};

common.clientNotification = function(client) {
  return function(done) {
    client.request('add', [3, 4], null, function(err) {
      if(err) throw err;
      arguments.length.should.equal(0);
      done();
    });
  };
};

common.clientBatch = function(client) {
  return function(done) {
    var batch = [
      client.request('add', [4, 9]),
      client.request('add', [10, 22])
    ];
    client.request(batch, function(err, responses) {
      should.not.exist(err);
      should.exist(responses);
      responses.should.be.instanceof(Array).and.have.length(2);
      responses[0].result.should.equal(4 + 9);
      responses[1].result.should.equal(10 + 22);
      done();
    });
  };
};
