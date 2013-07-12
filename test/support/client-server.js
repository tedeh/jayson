var should = require('should');
var support = require(__dirname);
var jayson = require(__dirname + '/../../');

// TODO Remove this and all references in tests
exports.methods = support.server.methods;
exports.options = support.server.options;
var Counter = exports.Counter = support.Counter;

exports.clientInstance = function(client) {
  return function() {
    client.should.be.instanceof(jayson.client);
  };
};

exports.clientRequest = function(client) {
  return function(done) {
    var a = 11, b = 12;
    client.request('add', [a, b], function(err, error, result) {
      should.not.exist(err);
      should.not.exist(error);
      should.exist(result);
      result.should.equal(a + b);
      done();
    });
  };
};

exports.clientError = function(client) {
  return function(done) {
    client.request('error', [], function(err, error, result) {
      should.not.exist(err);
      should.not.exist(result);
      should.exist(error);
      should.exist(error.code);
      should.exist(error.message);
      error.message.should.equal('An error message');
      error.code.should.equal(-1000);
      done();
    });
  };
};

exports.clientReviveReplace = function(client) {
  return function(done) {
    var a = 2, b = 1;
    var instance = new Counter(a);
    client.request('incrementCounterBy', [instance, b], function(err, error, result) {
      should.not.exist(err);
      should.not.exist(error);
      should.exist(result);
      result.should.be.instanceof(Counter).and.not.equal(instance, 'Not the same object');
      result.count.should.equal(a + b);
      done();
    });
  };
};

exports.clientNotification = function(client) {
  return function(done) {
    client.request('add', [3, 4], null, function(err) {
      arguments.length.should.equal(0);
      done();
    });
  };
};

exports.clientBatch = function(client) {
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
