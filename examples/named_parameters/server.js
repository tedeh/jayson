'use strict';

const jayson = require('./../..');

const server = jayson.server({
  add: function(params, callback) {
    callback(null, params.a + params.b);
  }
});

server.http().listen(3000);
