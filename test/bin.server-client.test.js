var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support');
var exec = require('child_process').exec;
var fs = require('fs');
var url = require('url');
var bin = __dirname + '/../bin/jayson.js';

describe('jayson binary', function() {

  var server = jayson.server(support.server.methods, support.server.options);;

  describe('port-listening server', function() {

    var http = null;
    var hostname = 'localhost';
    var port = 34000;
    var surl = url.format({
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

      var args = get_args(bin, {
        url: surl,
        method: 'add',
        quiet: true,
        json: true,
        params: JSON.stringify([4, 9])
      });

      exec(args, function(err, stdout, stderr) {
        if(err) throw err;

        should.exist(stdout, stderr);
        stderr.should.equal('');

        var json = JSON.parse(stdout);
        json.should.containDeep({
          result: 4 + 9
        });

        done();
      });
    });

  });

  describe('socket-listening server', function() {

    var http = null;
    var socketPath = __dirname + '/support/bin.test.socket';

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

      var args = get_args(bin, {
        socket: socketPath,
        method: 'add',
        quiet: true,
        json: true,
        params: JSON.stringify([1, 2])
      });

      exec(args, function(err, stdout, stderr) {
        if(err) throw err;
        var json = JSON.parse(stdout);
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
  var buf = binary;
  for(var arg in args) {
    var value = args[arg];
    buf += ' --' + arg;
    if(typeof(value) === 'string') {
      buf += ' "' + value + '"';
    }
  }
  return buf;
}
