var jayson = require('./../..');

var client = jayson.client.http({
  port: 3000
});

client.request('multiply', [5, 5], function(err, error, result) {
  if(err) throw err;
  console.log(result); // 25
});
