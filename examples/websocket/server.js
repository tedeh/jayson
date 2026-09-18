const jayson = require('../../');

const server = new jayson.Server({
  add: function (args, done) {
    const sum = args.reduce((sum, val) => sum + val, 0);
    done(null, sum);
  },
});

const _wss = server.websocket({
  port: 12345,
});
