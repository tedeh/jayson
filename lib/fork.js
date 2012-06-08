var jayson = require('./');
var utils = require('./utils');
var path = require('path');

var modulePath = path.resolve(process.argv.slice(2).shift());
var server = require(modulePath);

process.on('message', function(msg) {
  if(!isValidMessage(msg)) return;

  var request = {};
  var reviver = server.options.reviver;
  // parses JSON
  try { request = JSON.parse(msg.request, reviver); } catch(err) { return process.send({err: err, index: msg.index}); }

  server.call(request, function(err, response) {
    if(err) return process.send({err: err, index: msg.index});

    var body = '';
    var replacer = server.options.replacer;
    // stringifies JSON
    try { body = JSON.stringify(response, replacer); } catch(err) { return process.send({err: err, index: msg.index}); }

    process.send({response: body, index: msg.index});
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
