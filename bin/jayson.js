#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');

var pkg = require('../package.json');
var jayson = require('../');
var program = require('commander');
var eyes = require('eyes');

// initialize program and define arguments
program.version(pkg.version)
       .option('-m, --method [name]', 'Method', String)
       .option('-p, --params [json]', 'Array or Object to use as parameters', JSON.parse)
       .option('-u, --url [url]', 'URL to server', url.parse)
       .option('-q, --quiet', 'Only output the response value and any errors', Boolean)
       .option('-s, --socket [path]', 'Path to UNIX socket', parseSocket)
       .option('-j, --json', 'Only output the response value as JSON (implies --quiet)', Boolean)
       .option('-c, --color', 'Color output', Boolean)
       .parse(process.argv);

var inspect = eyes.inspector({
  stream: null,
  styles: program.color ? eyes.defaults.styles : {all: false}
});

// quiet is implied if json is specified
if(program.json) program.quiet = true;

// wrapper for printing different kinds of output
var std = {
  out: getPrinter(false),
  err: getPrinter(true)
};

// do we have all arguments required to do something?
if(!(program.method && program.params && (program.url || program.socket))) {
  std.err(program.helpInformation(), true);
  return process.exit(-1);
}

var client = jayson.client.http(program.url || program.socket);

std.out(
  colorize('magenta', '-> %s(%s)'),
  program.method,
  Array.isArray(program.params) ? program.params.join(', ') : JSON.stringify(program.params)
);

client.request(program.method, program.params, function(err, response) {
  if(err) {
    std.err(colorize('red', '<- %s'), err.stack);
    return process.exit(-1);
  }

  if(!response || program.json) {
    std.out('%s', JSON.stringify(response).replace("\n", ""), true);
    return process.exit(0);
  }

  std.out('<- %s', inspect(response), true);
  process.exit(response.error ? response.error.code : 0);
});

function parseSocket(value) {
  return {socketPath: path.normalize(value)};
}

function colorize(color, format) {
  return program.color
       ? eyes.stylize(format, color, {}) 
       : format;
}

function getPrinter(isError) {
  var out = isError ? console.error : console.log;
  return function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    // last argument (boolean) may indicate if this particular output should disregard --quiet
    var isNoisy = typeof(args[args.length - 1]) === 'boolean' ? args.pop() : false;
    if(!isNoisy && program.quiet) return;
    args.unshift(format);
    return out.apply(console, args);
  }
}
