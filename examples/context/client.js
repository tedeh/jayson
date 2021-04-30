'use strict';

const jayson = require('jayson');

// create a client
const client = new jayson.client.http({
  port: 3001
});

// invoke "getHeaders"
client.request('getHeaders', {}, function(err, response) {
  if(err) throw err;
  console.log(response.result);
});

