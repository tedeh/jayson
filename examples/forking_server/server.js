var jayson = require('../../');

var fork = jayson.server.fork('./fork');

var front = jayson.server({
  fib: jayson.client.fork({server: fork}),
  add: function(a, b, callback) { callback(null, a + b); }
});

front.http().listen(3000);
