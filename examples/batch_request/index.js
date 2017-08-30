var jayson = require('./../..');

var server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

var client = jayson.client(server);

var batch = [
  client.request('does_not_exist', [10, 5]),
  client.request('add', [1, 1]),
  client.request('add', [0, 0], null) // a notification
];

client.request(batch, function(err, errors, successes) {
  if(err) throw err;
  console.log('errors', errors); // array of requests that errored
  console.log('successes', successes); // array of requests that succeeded
});

client.request(batch, function(err, responses) {
  if(err) throw err;
  console.log('responses', responses); // all responses together
});
