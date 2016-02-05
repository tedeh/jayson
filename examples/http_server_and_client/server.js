var jayson = require(__dirname + '/../..');

var server = jayson.server({
  multiply: function(args, callback) {
    callback(null, args[0] * args[1]);
  }
});

server.http().listen(3000, function() {
  console.log('Server listening on http://localhost:3000');
});
