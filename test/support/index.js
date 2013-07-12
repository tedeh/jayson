var should = require('should');
var jayson = require(__dirname + '/../../');

exports.server = {};

exports.server.methods = {
  error: function(callback) {
    callback(this.error(-1000, 'An error message'));
  },
  incrementCounterBy: function(counter, value, callback) {
    if(!(counter instanceof Counter)) {
      return callback(this.error(-1000, 'Argument not an instance of Counter'));
    }
    counter.incrementBy(value);
    callback(null, counter);
  },
  add: function(a, b, callback) {
    var result = a + b;
    callback(null, result);
  },
  add_slow: function(a, b, isSlow, callback) {
    var result = a + b;
    if(!isSlow) return callback(null, result);
    setTimeout(function() {
      callback(null, result);
    }, 15);
  },
  empty: function(arg, callback) {
    callback();
  }
};

exports.server.options = {
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

var Counter = exports.Counter = function(value) {
  if(typeof(value) !== 'number' || !isFinite(value)) value = 0;
  this.count = value;
};

Counter.prototype.incrementBy = function(value) {
  this.count += value;
};

