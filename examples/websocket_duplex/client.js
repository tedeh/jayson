const jayson = require('../../');
const common = require('./common');

const server = common.getJaysonServer();

const client = jayson.client.websocket({
  url: 'ws://localhost:12345',
});

client.ws.on('open', function () {

  const intervalId = common.randomlyCallClient(client);

  client.ws.on('close', function () {
    console.log('connection to server closed');
    clearInterval(intervalId);
  });

  client.ws.on('message', function (buf) {
    const str = Buffer.isBuffer(buf) ? buf.toString('utf8') : buf;
    jayson.utils.JSON.parse(str, server.options, function(err, msg) {
      if (err) return console.error(err);
      if (jayson.utils.Request.isValidRequest(msg)) {
        server.call(msg, function(error, success) {
          const response = error || success;
          if (response) {
            jayson.utils.JSON.stringify(response, server.options, function (err, str) {
              if (err) {
                return respondError(err);
              }
              client.ws.send(str);
            });
          } else {
            // no response received at all, must be a notification which we do nothing about
          }
        });
      }
    });
  });

});
