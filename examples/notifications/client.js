var jayson = require(__dirname + '/../..');

var client = jayson.client.http({
  port: 3000
});

// the third parameter is set to "null" to indicate a notification
client.request('ping', [], null, function(err) {
  if(err) throw err;
  console.log('ok'); // request was received successfully
});
