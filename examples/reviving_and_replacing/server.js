var jayson = require('./../..');
var shared = require('./shared');

// Set the reviver/replacer options
var options = {
  reviver: shared.reviver,
  replacer: shared.replacer
};

// create a server
var server = jayson.server({
  increment: function(args, callback) {
    args.counter.increment();
    callback(null, args.counter);
  }
}, options);

server.http().listen(3000);
