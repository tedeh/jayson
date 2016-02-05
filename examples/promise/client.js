var jayson = require('../../promise');

var client = jayson.client.http({
  port: 3000
});

client.request('add', [1, 2, 3, 4, 5]).then(function(response) {
  console.log(response.result); // 15!
});
