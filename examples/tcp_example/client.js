'use strict';

const jayson = require('./../..');
const fs = require('fs');
const path = require('path');

const client = jayson.client.tcp('127.0.0.1:3000');

// invoke "add"
client.request('add', [1, 1], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 2
});
