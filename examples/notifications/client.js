var jayson = require(__dirname + '/../..');

var client = jayson.client.http({
  host: 'localhost',
  port: 3000
});

// the third parameter is set to "null" to indicate a notification
client.request('ping', [], null, function(err) {
  if(err) throw err;
  // request was received successfully
});
