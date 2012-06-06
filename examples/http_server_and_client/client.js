var jayson = require(__dirname + '/../../');

var client = jayson.client.http({ port: 3000, host: 'localhost' });

client.request('echo', ['Hello, world!'], function(err, reply) {
  console.log(reply);
});

client.request('multiply', [5, 5], function(err, reply) {
  console.log(reply);
});
