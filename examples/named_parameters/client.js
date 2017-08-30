var jayson = require('./../..');

var client = jayson.client.http({
  port: 3000
});

client.request('add', {b: 1, a: 2}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // 3!
});
