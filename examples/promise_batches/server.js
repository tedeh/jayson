'use strict';

const jayson = require('../../promise');
const _ = require('lodash');

const server = jayson.server({

  add: function(args) {
    return new Promise(function(resolve, reject) {
      const sum = _.reduce(args, function(sum, value) { return sum + value; }, 0);
      resolve(sum);
    });
  }

});

server.http().listen(3000);
