var should = require('should');
var jayson = require(__dirname + '/..');
var exec = require('child_process').exec;

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

describe('The binary', function() {
  describe('and a HTTP socket server', function() {
    var server = jayson.server(methods);
    var path = __dirname + '/bin.test.socket';
    var http = server.http();
    before(function(done) {
      http.listen(path, done);
    });
    after(function(done) {
      http.on('close', done);
      http.close();
    });
    it('should be callable with the binary and the --json switch', function(done) {
      var args = getArgs('socket:' + path, 'add', [1, 2]);
      exec(args, function(err, stdout, stderr) {
        should.not.exist(err);
        stderr.should.equal('');
        var json = {};
        (function() {
          json = jayson.utils.parse(stdout);
        }).should.not.throw();
        json.should.have.property('id');
        json.should.have.property('result');
        json.result.should.equal(3);
        done();
      });
    });
  });
});

function getArgs(server, method, params) {
  params = params || {};
  return binaryPath
       + ' --server ' + server
       + ' --method ' + method
       + ' --json'
       + ' --params "' + JSON.stringify(params) + '"';
}
