var jayson = require('./');
var utils = require('./utils');
var path = require('path');

var modulePath = path.resolve(process.argv.slice(2).shift());
var methods = require(modulePath);
var server = methods instanceof jayson.server ? methods : jayson.server(methods);

server.once('ready', function() {
  process.on('message', function(msg) {
    if(!isValidMessage(msg)) return;

    utils.JSON.parse(msg.request, server.options, function(err, request) {
      if(err) return process.send({err: err, index: msg.index}); 

      server.call(request, function(err, response) {
        if(err) return process.send({err: err, index: msg.index});

        utils.JSON.stringify(response, server.options, function(err, body) {
          if(err) return process.send({err: err, index: msg.index}); 

          process.send({response: body, index: msg.index});
        });
      });
    });
  });
});

// dont wait for "ready" from server?
if(!(server.options && server.options.wait)) {
  server.emit('ready');
}

function isValidMessage(msg) {
  return Boolean(
    msg
    && typeof(msg) === 'object'
    && typeof(msg.index) === 'number'
    && typeof(msg.request) === 'string'
  );
}
