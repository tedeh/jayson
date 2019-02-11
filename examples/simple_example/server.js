'use strict';

const jayson = require('./../..');

// create a server
const server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

server.http().listen(3000);
