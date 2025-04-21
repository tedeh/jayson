const jayson = require('../../');
const common = require('./common');

const server = common.getJaysonServer();

const wss = server.websocket({
  port: 12345,
});

wss.on('connection', function (ws) {
  const client = jayson.client.websocket({ws});
  const intervalId = common.randomlyCallClient(client);

  ws.on('close', function () {
    console.log('connection to client closed');
    clearInterval(intervalId);
  });
});
