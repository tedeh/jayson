var jayson = require(__dirname + '/../..');

var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

// let the private server listen to localhost:3001
server.http().listen(3001, '127.0.0.1', function() {
  console.log('Listening on 127.0.0.1:3001');
});
