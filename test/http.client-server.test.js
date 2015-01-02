var should = require('should');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var common = support.common;
var http = require('http');
var url = require('url');

describe('jayson http', function() {

  describe('server', function() {

    var server = null;

    after(function() {
      server.close();
    });

    it('should listen to a local port', function(done) {
      server = jayson.server(support.server.methods, support.server.options).http();
      server.listen(3000, 'localhost', done);
    });

    it('should be an instance of http.Server', function() {
      server.should.be.instanceof(http.Server);
    });

  });

  describe('client', function() {

    var client = jayson.client.http({
      reviver: support.server.options.reviver,
      replacer: support.server.options.replacer,
      host: 'localhost',
      port: 3000
    });

    var server = jayson.server(support.server.methods, support.server.options);
    var server_http = server.http();

    before(function(done) {
      server_http.listen(3000, 'localhost', done);
    });

    after(function() {
      server_http.close();
    });

    describe('common tests', common(client));

    it('should emit an event with the http request', function(done) {
      var hasFired = false;
      client.once('http request', function(req) {
        req.should.be.instanceof(http.ClientRequest);
        hasFired = true;
      });

      client.request('add', [10, 2], function(err, response) {
        if(err) throw err;
        hasFired.should.be.ok;
        done();
      });

    });

    it('should emit an event with the http response', function(done) {
      var hasFired = false;

      client.once('http response', function(res, req) {
        res.should.be.instanceof(http.IncomingMessage);
        req.should.be.instanceof(http.ClientRequest);
        hasFired = true;
      });

      client.request('add', [9, 4], function(err, response) {
        if(err) throw err;
        hasFired.should.be.ok;
        done();
      });

    });

    it('should accept a URL string as the first argument', function() {
      var urlStr = 'http://localhost:3000';
      var client = jayson.client.http(urlStr);
      var urlObj = url.parse(urlStr);
      Object.keys(urlObj).forEach(function(key) {
        client.options.should.have.property(key, urlObj[key]);
      });
    });

    it('should callback with an error on timeout', function(done) {

      client.once('http request', function(req) {
        req.setTimeout(5); // timeout 5 ms
      });

      client.request('add_slow', [4, 3, true], function(err, response) {
        should(err).be.instanceof(Error);
        should(response).not.exist;
        done();
      });

    });

  });

});
