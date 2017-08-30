var jayson = require('./../..');
var jsonParser = require('body-parser').json;
var connect = require('connect');
var app = connect();

var server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

// parse request body before the jayson middleware
app.use(jsonParser());
app.use(server.middleware());

app.listen(3000);
