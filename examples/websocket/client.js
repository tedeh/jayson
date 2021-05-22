const WebSocket = require('isomorphic-ws');
const jayson = require('../../');

const ws = new WebSocket('ws://localhost:12345');

const client = jayson.client.websocket(ws);

client.request('add', [1,2,3,4], function (err, result) {
  console.log(err, result);
});
