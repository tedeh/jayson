'use strict';

const jayson = require('jayson/promise');
const _ = require('lodash');

const server = new jayson.server({

  add: function(args) {
    return new Promise(function(resolve, reject) {
      const sum = _.reduce(args, function(sum, value) { return sum + value; }, 0);
      resolve(sum);
    });
  }

});

server.http().listen(3000);
