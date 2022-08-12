'use strict';

const jayson = require('jayson/promise');

const server = new jayson.server({

  add: async function(args) {
    const sum = Object.keys(args).reduce((sum, key) => sum + args[key], 0);
    return sum;
  },

  // example on how to reject
  rejection: async function(args) {
    // server.error just returns {code: 501, message: 'not implemented'}
    throw server.error(501, 'not implemented');
  }

});

server.http().listen(3000);
