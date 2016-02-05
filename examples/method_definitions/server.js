var jayson = require(__dirname + '/../..');
var _ = require('lodash');

var methods = {

  // this function will be wrapped in jayson.Method with options given to the server
  sum: function(args, done) {
    done(null, sum(args));
  },

  // this method gets the raw params as first arg to handler
  sumCollect: new jayson.Method({
    handler: function(args, done) {
      var total = sum(args);
      done(null, total);
    },
    collect: true // means "collect all JSON-RPC parameters in one arg"
  }),

  // specifies some default values (alternate definition too)
  sumDefault: jayson.Method(function(args, done) {
    var total = sum(args);
    done(null, total);
  }, {
    collect: true,
    params: {a: 2, b: 5} // map of defaults
  }),

  // this method returns true when it gets an array (which it always does)
  isArray: new jayson.Method({
    handler: function(args, done) {
      var result = _.isArray(args);
      done(null, result);
    },
    collect: true,
    params: Array // could also be "Object"
  })

};

var server = jayson.server(methods, {
  // Given as options to jayson.Method when adding the method "sum"
  collect: true,
  params: Array
});

server.http().listen(3000);

// sums all numbers in an array
function sum(list) {
  return _.reduce(list, function(sum, val) {
    return sum + val;
  }, 0);
}
