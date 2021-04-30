const WebSocket = require('isomorphic-ws');
const jayson = require('../../');

const ws = new WebSocket('ws://localhost:12345');

ws.onopen = function open() {
  console.log('connected');
  const req = jayson.utils.request('add', [1, 2, 3, 4, 5]);
  ws.send(JSON.stringify(req));
};

ws.onclose = function close() {
  console.log('disconnected');
};

ws.onmessage = data => {
  const msg = JSON.parse(data.data);
  console.log('got msg', msg);
};

