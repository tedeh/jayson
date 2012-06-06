var jayson = require(__dirname + '/../../');

var server = jayson.server({
  echo: function(msg, callback) {
    callback(null, msg);
  },
  multiply: function(a, b, callback) {
    callback(null, a * b);
  }
});

server.http().listen(3000, function() {
  console.log('Server listening on http://localhost:3000');
})
