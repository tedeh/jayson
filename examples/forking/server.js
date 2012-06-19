var jayson = require(__dirname + '/../..');

// creates a fork
var fork = jayson.server.fork(__dirname + '/fork');

var front = jayson.server({
  fib: jayson.client.fork(fork) // connects "fib" to the fork
});

// let the front server listen to localhost:3000
front.http().listen(3000);
