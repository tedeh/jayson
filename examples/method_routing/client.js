'use strict';

const jayson = require('jayson');

// create a client
const client = new jayson.client.http({
  port: 3000
});

// invoke "add_2"
client.request('add_2', [3], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 5!
});
