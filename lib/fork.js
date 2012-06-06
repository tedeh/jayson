var jayson = require('./');
var utils = require('./utils');

var server = jayson.server();

process.on('message', function(msg) {
  if(!msg || typeof(msg) !== 'object') return;
  if(msg.options) server.options = msg.options;
  if(msg.methods) {
    try {
      server.methods(msg.methods);
    } catch(err) {
      process.send({err: err});
    }
  }
  if(typeof(msg.index) === 'number' && msg.request) {
    server.call(msg.request, function(err, response) {
      if(err) return process.send({err: err, index: msg.index});
      process.send({response: response, index: msg.index});
    });
  }
});
