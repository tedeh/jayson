'use strict';

const jayson = require('jayson/promise');

const server = new jayson.server({

  add: function(args) {
    return new Promise(function(resolve, reject) {
      const sum = Object.keys(args).reduce((sum, value) => sum + value, 0);
      resolve(sum);
    });
  }

});

server.http().listen(3000);
