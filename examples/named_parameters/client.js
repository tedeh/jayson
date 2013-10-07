var jayson = require(__dirname + '/../../');

var client = jayson.client.http({
  host: 'localhost',
  port: 3000
});

client.request('add', {b: 1, a: 2}, function(err, error, response) {
  if(err) throw err;
  console.log(response); // 3!
});
