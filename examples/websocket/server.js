const WebSocket = require('ws');
const jayson = require('../../');

const server = jayson.server({
  add: function (args, done) {
    const sum = args.reduce((sum, val) => sum + val, 0);
    done(null, sum);
  },
});

const wss = server.websocket({
  port: 12345,
});

// wss.on('connection', ws => {
//   ws.on('message', str => {
//     const msg = JSON.parse(str);
//     if (jayson.Utils.Request.isValidRequest(msg)) {
//       server.call(msg, function (err, response) {
//         const str = JSON.stringify(response);
//         console.log('sending', str)
//         ws.send(str);
//       });
//     }
//   });
// });
