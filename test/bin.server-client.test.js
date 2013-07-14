var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');
var exec = require('child_process').exec;
var url = require('url');
var bin = __dirname + '/../bin/jayson.js';

describe('jayson binary', function() {

  var server;

  beforeEach(function() {
    server = jayson.server(support.methods, support.options);
  });

  describe('port-listening server', function() {

    var http = null;
    var hostname = 'localhost';
    var port = 1337;
    var surl = url.format({
      port: port,
      protocol: 'http',
      hostname: hostname
    });

    beforeEach(function(done) {
      http = server.http();
      http.listen(port, hostname, done);
    });

    afterEach(function(done) {
      http.on('close', done);
      http.close();
    });

    it('should be callable', function(done) {
      var a = 3, b = 4;
      var args = getArgs(bin, {
        url: surl, method: 'add', json: true,
        params: JSON.stringify([a, b])
      });

      exec(args, function(err, stdout, stderr) {
        should.not.exist(err);
        should.exist(stdout, stderr);
        var json = JSON.parse(stdout);
        json.should.have.property('id');
        json.should.have.property('result');
        json.result.should.equal(a + b);
        stderr.should.equal('');
        done();
      });
    });

  });

  describe('socket-listening server', function() {

    var http = null;
    var socketPath = __dirname + '/support/bin.test.socket';

    before(function(done) {
      http = server.http();
      http.listen(socketPath, done);
    });

    after(function(done) {
      http.on('close', done);
      http.close();
    });

    it('should be callable', function(done) {
      var a = 1, b = 2;
      var args = getArgs(bin, {
        socket: socketPath, method: 'add', json: true,
        params: JSON.stringify([a, b])
      });
      exec(args, function(err, stdout, stderr) {
        should.not.exist(err);
        var json = JSON.parse(stdout);
        json.should.have.property('id');
        json.should.have.property('result');
        json.result.should.equal(a + b);
        stderr.should.equal('');
        done();
      });
    });

  });

});

function getArgs(binary, args) {
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
