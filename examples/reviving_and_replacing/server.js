var jayson = require(__dirname + '/../..');
var shared = require('./shared');

// Set the reviver/replacer options
var options = {
  reviver: shared.reviver,
  replacer: shared.replacer
};

// create a server
var server = jayson.server({
  increment: function(counter, callback) {
    counter.increment();
    callback(null, counter);
  }
}, options);

// let the server listen to for http connections on localhost:3000
server.http().listen(3000);
