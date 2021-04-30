'use strict';

const jayson = require('jayson');

const client = new jayson.client.http({
  port: 3000
});

client.request('multiply', [5, 5], function(err, error, result) {
  if(err) throw err;
  console.log(result); // 25
});
