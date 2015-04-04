var jayson = require(__dirname + '/../..');

// create a client
var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost'
});

// invoke "addCollect" with array
client.request('addCollect', [3, 5, 9, 11], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 28
});

// invoke "addCollect" with object
client.request('addCollect', {a: 2, b: 3, c: 4}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // 9
});

// invoke "addDefault" with object missing some defined members
client.request('addDefault', {b: 10}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // 12
});

// invoke "acceptArray" with an Object
client.request('acceptArray', {a: 5, b: 2, c: 9}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // true
});
