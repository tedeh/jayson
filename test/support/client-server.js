var should = require('should');
var jayson = require(__dirname + '/../../');

exports.methods = {
  add: function(a, b, callback) {
    callback(null, a + b);
  },
  error: function(callback) {
    callback(this.error(-1000, 'An error message'));
  },
  incrementCounterBy: function(counter, value, callback) {
    if(!(counter instanceof Counter)) {
      return callback(this.error(-1000, 'Argument not an instance of Counter'));
    }
    counter.incrementBy(value);
    callback(null, counter);
  }
};

var Counter = exports.Counter = function(value) {
  this.count = typeof(value) === 'number' ? value : 0;
};

Counter.prototype.incrementBy = function(value) {
  this.count += value;
};

exports.options = {
  reviver: function(key, value) {
    if(value && value.$class === 'counter') {
      var obj = new Counter();
      for(var prop in value.$props) obj[prop] = value.$props[prop];
      return obj;
    }
    return value;
  },
  replacer: function(key, value) {
    if(value instanceof Counter) {
      return {$class: 'counter', $props: {count: value.count}};
    }
    return value;
  }
};

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
