var jayson = require(__dirname + '/../..');
var connect = require('connect');
var app = connect();

var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

// parse request body before the jayson middleware
app.use(connect.bodyParser());
app.use(server.middleware());

app.listen(3000);
