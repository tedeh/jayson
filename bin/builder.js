#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');

var program = require('commander');
var eyes = require('eyes');
var uglify = require('uglify-js');

program.version('1.0.0')
       .parse(process.argv);

var targets = [
  { in: 'lib/client/jquery.js', out: 'build/jquery.jayson.js' },
  { in: 'lib/client/jquery.js', out: 'build/jquery.jayson.min.js', minify: true }
];

console.log();

targets.forEach(function(target) {
  var str = fs.readFileSync(target.in, 'utf8');
  if(target.minify) {
    var ast = uglify.parser.parse(str);
    ast = uglify.uglify.ast_mangle(ast);
    ast = uglify.uglify.ast_squeeze(ast);
    str = uglify.uglify.gen_code(ast);
  }
  fs.writeFileSync(target.out, str, 'utf8');
  console.log("  wrote " + eyes.stylize('%s', 'magenta', {}), target.out);
});

console.log();
