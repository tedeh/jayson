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

// dictionary param
var dic_parameters = {
    value_a: "value1",
    value_b: "value2",
};

client.request('cat', dic_parameters, function(err, error, response) {
    if(err) throw err;
    console.log(response); // 2!
});
