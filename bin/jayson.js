#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');

var jayson = require('../');
var program = require('commander');
var eyes = require('eyes');

// initialize program and define arguments
program.version('1.0.0')
       .option('-m, --method [name]', 'Method', String)
       .option('-p, --params [json]', 'Array or Object to use as parameters', JSON.parse)
       .option('-s, --server [path]', 'Path or URL to server', url.parse)
       .option('-q, --quiet', 'Only output the return value and any errors', Boolean)
       .option('-c, --color', 'Color output', Boolean)
       .parse(process.argv);

var serverName = program.server ? url.format(program.server) : null;

var inspect = eyes.inspector({
  stream: null,
  styles: program.color ? eyes.defaults.styles : {all: false}
});

// wrapper for printing output
var print = {
  out: function(isRecv, mutable, format) {
    var tokens = Array.prototype.slice.call(arguments, 3);
    format = typeof(format) === 'string' ? format : '';
    if(program.quiet && mutable) return;

    // append some tokens if not quiet
    if(!program.quiet) {
      var direction = isRecv ? ' -> ' : ' <- ';
      format = (program.color ? eyes.stylize(direction, 'bold', {}) : direction) + format;
      format = (program.color ? eyes.stylize('%s', 'yellow', {}) : '%s') + format
      tokens.unshift(serverName);
    }
    console.log.apply(console, [format].concat(tokens));
  },
  err: console.error
};

// arguments correct?
if(!program.method || !program.params || !program.server) {
  print.err(program.helpInformation());
  process.exit(-1);
}

var client = jayson.client.http(program.server);

print.out(
  false,
  true,
  program.color ? eyes.stylize('%s(%s)', 'magenta', {}) : '%s(%s)',
  program.method,
  Array.isArray(program.params) ? program.params.join(', ') : JSON.stringify(program.params)
);

client.request(program.method, program.params, function(err, error, result) {
  if(err) throw err;
  if(error) {
    print.out(true, false, '%s', inspect(error));
  } else {
    print.out(true, false, '%s', inspect(result));
  }
});
