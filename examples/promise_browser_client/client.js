'use strict';

const jaysonPromiseBrowserClient = require('jayson/promise/lib/client/browser');
const fetch = require('node-fetch');

const callServer = function(request) {
  const options = {
    method: 'POST',
    body: request,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  return fetch('http://localhost:3000', options).then(res => res.text());
};

const client = new jaysonPromiseBrowserClient(callServer, {
  // other options go here
});

client.request('multiply', [5, 5]).then(function(result) {
  console.log(result);
}, function(err) {
  console.error(err);
});
