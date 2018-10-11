var jayson = require('./../..');

// create a client
var client = jayson.client.http({
  port: 3001
});

// invoke "getHeaders"
client.request('getHeaders', {}, function(err, response) {
  if(err) throw err;
  console.log(response.result);
});

