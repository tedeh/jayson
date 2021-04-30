'use strict';

const jayson = require('jayson');

const client = new jayson.client.http({
  port: 3000
});

client.request('myNameIs', {name: 'Mr. Creosote'}, function(err, error, result) {
  if(err) throw err;
  console.log(result); // 'Your name is: Mr. Creosote'
});
