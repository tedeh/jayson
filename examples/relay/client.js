'use strict';

const jayson = require('jayson');

const client = new jayson.client.http({
  port: 3000 // the port of the frontend server
});

client.request('add', [5, 9], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 14
});
