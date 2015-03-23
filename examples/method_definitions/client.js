var jayson = require(__dirname + '/../..');

// create a client
var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost'
});

// invoke "add_2"
client.request('add_2', [3], function(err, error, response) {
  if(err) throw err;
  console.log(response); // 5!
});

