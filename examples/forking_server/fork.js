var jayson = require('../../');

module.exports = jayson.server({
  fib: function(n, callback) {
    function fib(n) {
      if(n < 2) return n;
      return fib(n - 1) + fib(n - 2);
    };
    callback(null, fib(n));
  }
});
