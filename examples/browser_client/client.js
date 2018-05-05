var jaysonBrowserClient = require('./../../lib/client/browser');
var fetch = require('node-fetch');

var callServer = function(request, callback) {
  var options = {
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

var client = jaysonBrowserClient(callServer, {
  // other options go here
});

client.request('multiply', [5, 5], function(err, error, result) {
  if(err) throw err;
  console.log(result); // 25
});
