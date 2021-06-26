const jayson = require('../../');

const client = jayson.client.websocket({
  url: 'ws://localhost:12345',
});

client.ws.on('open', function () {
  client.request('add', [1,2,3,4], function (err, result) {
    console.log(err, result);
    client.ws.close();
  });
});
