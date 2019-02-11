'use strict';

const should = require('should');
const jayson = require('./../lib');
const support = require('./support');
const exec = require('child_process').exec;
const fs = require('fs');
const url = require('url');
const bin = __dirname + '/../bin/jayson.js';

describe('jayson.bin', function() {

  const server = jayson.server(support.server.methods(), support.server.options());

  describe('port-listening http server', function() {

    let http = null;
    const hostname = 'localhost';
    const port = 34000;
    const surl = url.format({
      port: port,
      protocol: 'http',
      hostname: hostname
    });

    before(function(done) {
      http = server.http();
      http.listen(port, hostname, done);
    });

    after(function(done) {
      http.on('close', done);
      http.close();
    });

    it('should be callable', function(done) {

      const args = get_args(bin, {
        url: surl,
        method: 'add',
        quiet: true,
        json: true,
        params: JSON.stringify([4, 9])
      });

      exec(args, function(err, stdout, stderr) {
        if(err) return done(err);

        should.exist(stdout, stderr);
        stderr.should.equal('');

        const json = JSON.parse(stdout);
        json.should.containDeep({
          result: 4 + 9
        });

        done();
      });
    });

  });

  describe('port-listening tcp server', function() {

    let tcp = null;
    const hostname = 'localhost';
    const port = "35000";
    const socket = hostname + ":" + port;

    before(function(done) {
      tcp = server.tcp();
      tcp.listen(port, hostname, done);
    });

    after(function(done) {
      tcp.on('close', done);
      tcp.close();
    });

    it('should be callable', function(done) {

      const args = get_args(bin, {
        socket: socket,
        method: 'add',
        quiet: true,
        json: true,
        params: JSON.stringify([1, 2])
      });

      exec(args, function(err, stdout, stderr) {
        if(err) return done(err);
        const json = JSON.parse(stdout);
        stderr.should.equal('');

        json.should.containDeep({
          result: 1 + 2
        });

        done();
      });
    });

  });

  describe('unix domain socket-listening server', function() {

    let http = null;
    const socketPath = __dirname + '/support/bin.test.socket';

    before(function(done) {
      try {
        fs.unlinkSync(socketPath);
      } catch(ignore) {
      }
      http = server.http();
      http.listen(socketPath, done);
    });

    after(function(done) {
      http.on('close', done);
      http.close();
    });

    it('should be callable', function(done) {

      const args = get_args(bin, {
        socket: socketPath,
        method: 'add',
        quiet: true,
        json: true,
        params: JSON.stringify([1, 2])
      });

      exec(args, function(err, stdout, stderr) {
        if(err) return done(err);
        const json = JSON.parse(stdout);
        stderr.should.equal('');

        json.should.containDeep({
          result: 1 + 2
        });

        done();
      });
    });

  });

});

function get_args(binary, args) {
  let buf = binary;
  for(const arg in args) {
    const value = args[arg];
    buf += ' --' + arg;
    if(typeof(value) === 'string') {
      buf += ' "' + value + '"';
    }
  }
  return buf;
}
