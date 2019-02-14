'use strict';

const jayson = require('./../..');
const _ = require('lodash');

const methods = {

  // this function will be wrapped in jayson.Method with options given to the server
  sum: function(args, done) {
    done(null, sum(args));
  },

  // this function always receives a context object as second arg
  // it can be overriden on the server level
  context: jayson.Method(function(args, context, done) {
    done(null, context);
  }, {useContext: true}),

  // specifies some default values (alternate definition too)
  sumDefault: jayson.Method(function(args, done) {
    const total = sum(args);
    done(null, total);
  }, {
    params: {a: 2, b: 5} // map of defaults
  }),

  // this method returns true when it gets an array (which it always does)
  isArray: new jayson.Method({
    handler: function(args, done) {
      const result = _.isArray(args);
      done(null, result);
    },
    params: Array // could also be "Object"
  })

};

const server = jayson.server(methods, {
  // these options are given as options to jayson.Method when adding the method "sum".
  // this is because it is not wrapped in jayson.Method like the others.
  useContext: false,
  params: Array
});

server.http().listen(3000);

// sums all numbers in an array or object
function sum(list) {
  return _.reduce(list, function(sum, val) {
    return sum + val;
  }, 0);
}
