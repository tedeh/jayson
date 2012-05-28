var should = require('should');
var jayson = require(__dirname + '/../../');

// TODO Remove
Date.prototype.toJSON = function() { return {$date: this.getTime()}; };

exports.methods = {
  add: function(a, b, callback) {
    callback(null, a + b);
  },
  error: function(callback) {
    callback(this.error(-1000, 'An error message'));
  },
  addOneSecond: function(date, callback) {
    if(!(date instanceof Date)) return callback(this.error(-1000, 'Argument not a "Date"'));
    date.setTime(date.getTime() + 1000);
    callback(null, date);
  }
};

exports.options = {
  reviver: function(k, v) {
    if(v && typeof(v.$date) === 'number') return new Date(v.$date);
    return v;
  },
  replacer: function(k, v) {
    if(v instanceof Date) return {$date: v.getTime()};
    return v;
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
    var now = new Date();
    client.request('addOneSecond', [now], function(err, error, result) {
      should.not.exist(err);
      should.not.exist(error);
      should.exist(result);
      result.should.be.instanceof(Date);
      var time = result.getTime();
      time.should.equal(now.getTime() + 1000);
      done();
    });
  };
};
