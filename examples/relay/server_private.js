'use strict';

const jayson = require('jayson');

const server = new jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

// let the backend listen to *:3001
server.http().listen(3001);
