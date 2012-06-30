var jayson = require(__dirname + '/../..');

var server = jayson.server({
  ping: function(callback) {
    // do something
    callback();
  }
});

server.http().listen(3000);
