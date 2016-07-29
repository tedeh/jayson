var jayson = require('../../promise');

var client = jayson.client.http({
  port: 3000
});

var reqs = [
  client.request('add', [1, 2, 3, 4, 5]),
  client.request('rejection', [])
];

Promise.all(reqs).then(function(responses) {
  console.log(responses[0].result);
  console.log(responses[1].error);
});
