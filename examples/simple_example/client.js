var jayson = require(__dirname + '/../..');

// create a client
var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost'
});

// invoke "add"
client.request('add', [1, 1], function(err, error, response) {
  if(err) throw err;
  console.log(response); // 2!
});
