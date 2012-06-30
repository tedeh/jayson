var jayson = require(__dirname + '/../..');

var server = jayson.server({
  add: function(a, b, callback) {
    return callback(null, a + b);
  }
});

// "http" will be an instance of require('http').Server
var http = server.http();

// "https" will be an instance of require('https').Server
var https = server.https({
  //cert: require('fs').readFileSync('cert.pem'),
  //key require('fs').readFileSync('key.pem')
});

http.listen(80, function() {
  console.log('Listening on *:80')
});

https.listen(443, function() {
  console.log('Listening on *:443')
});
