var jayson = require(__dirname + '/../..');

var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost'
});

// request "fib" on the server
client.request('fib', [15], function(err, response) {
  console.log(response);
});
