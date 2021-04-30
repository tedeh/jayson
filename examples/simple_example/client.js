'use strict';

const jayson = require('jayson');

// create a client
const client = new jayson.client.http({
  port: 3000
});

// invoke "add"
client.request('add', [1, 1], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 2
});
