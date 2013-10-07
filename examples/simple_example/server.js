var jayson = require(__dirname + '/../..');

// create a server
var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  },
  cat: function(value_a,value_b,callback){
    callback(null, value_a.concat(value_b));
  }
});

// Bind a http interface to the server and let it listen to localhost:3000
server.http().listen(3000);
