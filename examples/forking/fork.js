// export "fib" for forking
exports.fib = function(n, callback) {
  function fib(n) {
    if(n < 2) return n;
    return fib(n - 1) + fib(n - 2);
  };
  var result = fib(n);
  callback(null, fib(n));
};
