'use strict';

const jaysonBrowserClient = require('./../../lib/client/browser');
const fetch = require('node-fetch');

const callServer = function(request, callback) {
  const options = {
    method: 'POST',
    body: request,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  fetch('http://localhost:3000', options)
    .then(function(res) { return res.text(); })
    .then(function(text) { callback(null, text); })
    .catch(function(err) { callback(err); });
};

const client = jaysonBrowserClient(callServer, {
  // other options go here
});

client.request('multiply', [5, 5], function(err, error, result) {
  if(err) throw err;
  console.log(result); // 25
});
