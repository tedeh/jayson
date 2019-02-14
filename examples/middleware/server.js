'use strict';

const jayson = require('./../..');
const jsonParser = require('body-parser').json;
const connect = require('connect');
const app = connect();

const server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

// parse request body before the jayson middleware
app.use(jsonParser());
app.use(server.middleware());

app.listen(3000);
