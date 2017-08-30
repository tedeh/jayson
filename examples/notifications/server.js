var jayson = require('./../..');

var server = jayson.server({
  ping: function(args, callback) {
    // do something, do nothing
    callback();
  }
});

server.http().listen(3000);
