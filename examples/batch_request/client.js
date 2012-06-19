var jayson = require(__dirname + '/../..');
var client = jayson.client.http({
  host: 'localhost',
  port: 3000
});

var batch = [
  client.request('does_not_exist', [10, 5]),
  client.request('add', [1, 1]),
  client.request('add', [0, 0], null) // a notification
];

// callback takes three arguments (first type of callback)
client.request(batch, function(err, errors, successes) {
  if(err) throw err;
  // errors is an array of the requests that errored
  console.log('errors', errors);
  // successes is an array of requests that succeded
  console.log('successes', successes);
});

// callback takes two arguments (second type of callback)
client.request(batch, function(err, responses) {
  if(err) throw err;
  // responses is an array of errors and successes together
  console.log('responses', responses);
});
