'use strict';

const jayson = require('./../..');

const client = jayson.client.http({
  port: 3000
});

// invoke "add" with array of finite numbers
client.request('add', [3, 5, 9, 11], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 28
});

// invoke "add" with faulty numbers
client.request('add', [3, null, 'bla'], function(err, response) {
  if(err) throw err;
  console.log(response.error);
});
