'use strict';

const jayson = require('./../..');
const shared = require('./shared');

// Set the reviver/replacer options
const options = {
  reviver: shared.reviver,
  replacer: shared.replacer
};

// create a server
const server = jayson.server({
  increment: function(args, callback) {
    args.counter.increment();
    callback(null, args.counter);
  }
}, options);

server.http().listen(3000);
