var jayson = require('../../');

var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost'
});

client.request('fib', [10], function(err, response) {
  console.log(arguments);
});

client.request('add', [3, 6], function(err, response) {
  console.log(arguments);
});
