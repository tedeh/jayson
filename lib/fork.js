var jayson = require('./');
var utils = require('./utils');
var path = require('path');

var modulePath = path.resolve(process.argv.slice(2).shift());
var server = require(modulePath);

process.on('message', function(msg) {
  if(!isValidMessage(msg)) return;
  utils.parse(msg.request, server.options.reviver, function(err, request) {
    if(err) return process.send({err: err, index: msg.index});
    server.call(request, function(err, response) {
      if(err) return process.send({err: err, index: msg.index});
      utils.stringify(response, server.options.replacer, function(err, response) {
        if(err) return process.send({err: err, index: msg.index});
        process.send({response: response, index: msg.index});
      });
    });
  });
});

function isValidMessage(msg) {
  return Boolean(
    msg
    && typeof(msg) === 'object'
    && typeof(msg.index) === 'number'
    && typeof(msg.request) === 'string'
  );
}
