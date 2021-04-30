'use strict';

const jayson = require('jayson');

const server = new jayson.server({
  ping: function(args, callback) {
    // do something, do nothing
    callback();
  }
});

server.http().listen(3000);
