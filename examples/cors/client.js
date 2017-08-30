var jayson = require('./../..');

var client = jayson.client.http({
  port: 3000
});

client.request('myNameIs', {name: 'Mr. Creosote'}, function(err, error, result) {
  if(err) throw err;
  console.log(result); // 'Your name is: Mr. Creosote'
});
