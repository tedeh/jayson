var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support/client-server');

var exec = require('child_process').exec;

var bin = __dirname + '/../bin/jayson.js';

describe('jayson binary', function() {

  var server = jayson.server(support.methods, support.options);

  var http = null;

  describe('port server', function() {

    var hostname = 'localhost';
    var port = 1337;
    var url = require('url').format({
      port: port,
      protocol: 'http',
      hostname: hostname
    });

    before(function(done) {
      http = server.http();
      http.listen(port, hostname, done);
    });

  it('should be callable', function(done) {
    var a = 3, b = 4;
    var args = formatArgs(bin, {
      url: url, method: 'add', json: true,
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

  describe('socket server', function() {

    var socketPath = __dirname + '/support/bin.test.socket';

    before(function(done) {
      http = server.http();
      http.listen(socketPath, done);
    });

    it('should be callable', function(done) {
      var a = 1, b = 2;
      var args = formatArgs(bin, {
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

  afterEach(function(done) {
    if(!http) done();
    http.on('close', done);
    http.close();
  });

});

function formatArgs(binary, args) {
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
