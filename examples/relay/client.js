var jayson = require(__dirname + '/../..');

var client = jayson.client.http({
  port: 3000 // the port of the frontend server
});

client.request('add', [5, 9], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 14
});
