var jayson = require('../../promise');

var client = jayson.client.http({
  port: 3000
});

var batch = [
  client.request('add', [1, 2, 3, 4, 5], undefined, false),
  client.request('add', [5, 6, 7, 8, 9], undefined, false),
];

client.request(batch).then(function(responses) {
  console.log(responses[0].result); // 15
  console.log(responses[1].result); // 35
});
