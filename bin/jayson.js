#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');

var pkg = require('../package.json');
var jayson = require('../');
var program = require('commander');
var eyes = require('eyes');
var net = require('net')

// initialize program and define arguments
program.version(pkg.version)
       .option('-m, --method [name]', 'Method', String)
       .option('-p, --params [json]', 'Array or Object to use as parameters', JSON.parse)
       .option('-u, --url [url]', 'URL to server', url.parse)
       .option('-q, --quiet', 'Only output the response value and any errors', Boolean)
       .option('-s, --socket [path] or [ip:port]', 'Path to UNIX socket, or TCP socket address', parseSocket)
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
  out: getPrinter({ fn: console.log }),
  err: getPrinter({ fn: console.error })
};

// do we have all arguments required to do something?
if(!(program.method && (program.url || program.socket))) {
  std.err.result(program.helpInformation());
  return process.exit(-1);
}

var client = (program.socket && program.socket.host)
  ? jayson.client.tcp(program.socket)
  : jayson.client.http(program.url || program.socket);

std.out.noise(
  colorize('magenta', '-> %s(%s)'),
  program.method,
  Array.isArray(program.params) ? program.params.join(', ') : JSON.stringify(program.params)
);

client.request(program.method, program.params, function(err, response) {
  if(err) {
    std.err.noise(colorize('red', '<- %s'), err.stack);
    return process.exit(-1);
  }

  if(!response || program.json) {
    std.out.result('%s', JSON.stringify(response).replace("\n", ""));
    return process.exit(0);
  }

  std.out.noise('<- %s', inspect(response), true);
  process.exit(response.error ? response.error.code : 0);
});

function parseSocket(value) {
  var addr = value.split(":");

  if (addr.length == 2 && (net.isIP(addr[0]) || addr[0].toLowerCase() == "localhost")) {
    return {port: addr[1], host: addr[0]};
  }

  return {socketPath: path.normalize(value)};
}

function colorize(color, format) {
  return program.color
       ? eyes.stylize(format, color, {}) 
       : format;
}

function getPrinter(options) {

  var fn = options.fn || console.log;

  return {

    // print noise (printed if program is not quiet)
    noise: function() {
      if(program.quiet) return;
      return fn.apply(console, arguments);
    },

    // print results (always printed)
    result: function() {
      return fn.apply(console, arguments);
    }
  
  };
}
