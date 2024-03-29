'use strict';

const jayson = require('jayson');

const client = new jayson.client.http({
  port: 3000
});

// invoke "sum" with array
client.request('sum', [3, 5, 9, 11], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 28
});

// invoke "sum" with an object
client.request('sum', {a: 2, b: 3, c: 4}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // 9
});

// invoke "sumDefault" with object missing some defined members
client.request('sumDefault', {b: 10}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // 12
});

// invoke "isArray" with an Object
client.request('isArray', {a: 5, b: 2, c: 9}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // true
});

// invoke "context"
client.request('context', {hello: 'world'}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // {} - just an empty object
});
