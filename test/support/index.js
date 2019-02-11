'use strict';

const _ = require('lodash');
const should = require('should');
const jayson = require('./../../');
const fs = require('fs');

exports.Counter = require('./counter');

exports.server = {};

exports.server.keys = () => ({
  ca: [fs.readFileSync(__dirname + '/../fixtures/keys/ca1-cert.pem')],
  key: fs.readFileSync(__dirname + '/../fixtures/keys/agent1-key.pem'),
  cert: fs.readFileSync(__dirname + '/../fixtures/keys/agent1-cert.pem')
});

/*
 * Methods for the common test server
 */
exports.server.methods = () => ({

  error: function(args, callback) {
    callback(this.error(-1000, 'An error message'));
  },

  incrementCounterBy: function(args, callback) {
    const {counter, value} = _.isArray(args) ? {counter: args[0], value: args[1]} : args;
    if(!(counter instanceof exports.Counter)) {
      return callback(this.error(-1000, 'Argument not an instance of Counter'));
    }
    counter.incrementBy(value);
    callback(null, counter);
  },

  add: function(args, callback) {
    const result = _.reduce(args, (sum, arg) => _.isNumber(arg) ? sum + arg : sum, 0);
    callback(null, result);
  },

  add_slow: function([a, b, isSlow], callback) {
    const result = a + b;
    if(!isSlow) return callback(null, result);
    setTimeout(function() {
      callback(null, result);
    }, 15);
  },

  empty: function(arg, callback) {
    callback();
  },

  invalidError: function(arg, callback) {
    callback({invalid: true});
  },

  delay: function([delay], callback) {
    setTimeout(function() {
      callback(null, delay);
    }, delay);
  }

});

/*
 * Options for the common test server
 */
exports.server.options = () => ({

  reviver: function(key, value) {
    if(value && value.$class === 'counter') {
      const obj = new exports.Counter();
      for(const prop in value.$props) obj[prop] = value.$props[prop];
      return obj;
    }
    return value;
  },

  replacer: function(key, value) {
    if(value instanceof exports.Counter) {
      return {$class: 'counter', $props: {count: value.count}};
    }
    return value;
  },

});
