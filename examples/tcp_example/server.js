'use strict';

const jayson = require('jayson');

// create a server
const server = new jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

// Bind a http interface to the server and let it listen to localhost:3000
server.tcp().listen(3000);
