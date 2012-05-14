var should = require('should');
var jayson = require(__dirname + '/..');
var exec = require('child_process').exec;
var url = require('url');

var methods = {
  add: function(a, b, callback) { callback(null, a + b); }
};

var binaryPath = __dirname + '/../bin/jayson.js';

describe('A HTTP server', function() {
  var server = jayson.server(methods);
  var http = server.http();

  it('should be able to listen to a temporary socket', function(done) {
    http.listen(__dirname + '/bin.test.socket', done);
  });

  after(function(done) {
    http.on('close', done);
    http.close();
  });

});

describe('A HTTP socket server', function() {
  var server = jayson.server(methods);
  var path = __dirname + '/bin.test.socket';
  var http = server.http();

  before(function(done) {
    http.listen(path, done);
  });

  it('should be callable', function(done) {
    var args = formatArgs(binaryPath, {
      socket: path,
      method: 'add',
      params: JSON.stringify([1, 2]),
      json: true
    });
    exec(args, function(err, stdout, stderr) {
      should.not.exist(err);
      var json = {};
      (function() {
        json = jayson.utils.parse(stdout);
      }).should.not.throw();
      json.should.have.property('id');
      json.should.have.property('result');
      json.result.should.equal(3);
      stderr.should.equal('');
      done();
    });
  });

  after(function(done) {
    http.on('close', done);
    http.close();
  });
});

describe('A HTTP port server', function() {
  var server = jayson.server(methods);
  var http = server.http();
  var hostname = 'localhost';
  var port = 3000;
  var urlStr = url.format({
    port: port,
    protocol: 'http',
    hostname: hostname
  });

  before(function(done) {
    http.listen(port, hostname, done);
  });

  it('should be callable', function(done) {
    var args = formatArgs(binaryPath, {
      url: urlStr,
      method: 'add',
      params: JSON.stringify([3, 4]),
      json: true
    });
    exec(args, function(err, stdout, stderr) {
      should.not.exist(err);
      should.exist(stdout, stderr);
      var json = {};
      (function() { json = jayson.utils.parse(stdout); }).should.not.throw();
      json.should.have.property('id');
      json.should.have.property('result');
      json.result.should.equal(7);
      stderr.should.equal('');
      done();
    });
  });

  after(function(done) {
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
