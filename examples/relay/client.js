var jayson = require(__dirname + '/../..');

var client = jayson.client.http({
  hostname: 'localhost',
  port: 3000 // the port of the public server
});

client.request('add', [5, 9], function(err, error, result) {
  if(err) throw err;
  console.log(result); // 14!
});
