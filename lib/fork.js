var jayson = require('./');
var utils = require('./utils');
var path = require('path');

var modulePath = path.resolve(process.argv.slice(2).shift());
var server = require(modulePath);

process.on('message', function(msg) {
  if(!msg || typeof(msg) !== 'object') return;
  if(typeof(msg.index) === 'number' && msg.request) {
    server.call(msg.request, function(err, response) {
      if(err) return process.send({err: err, index: msg.index});
      process.send({response: response, index: msg.index});
    });
  }
});
