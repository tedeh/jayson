var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support');
var suites = require(__dirname + '/support/suites');
var http = require('http');
var https = require('https');
var url = require('url');

describe('Jayson.Https', function() {

  describe('server', function() {

    var server = null;

    after(function() {
      if(server) server.close();
    });

    it('should listen to a local port', function(done) {
        server = jayson.server(support.methods, support.options).https(support.server.keys);
        server.listen(3000, 'localhost', done);
    });

    it('should be an instance of https.Server', function() {
      server.should.be.instanceof(https.Server);
    });

  });

  describe('client', function() {
    
    var server = jayson.server(support.server.methods, support.server.options);
    var server_https = server.https(support.server.keys);
    var client = jayson.client.https({
      reviver: support.server.options.reviver,
      replacer: support.server.options.replacer,
      host: 'localhost',
      port: 3000,
      ca: support.server.keys.ca
    });

    before(function(done) {
      server_https.listen(3000, 'localhost', done);
    });

    after(function() {
      server_https.close();
    });

    describe('common tests', suites.getCommonForClient(client));

    it('should emit an event with the http response', function(done) {
      var hasFired = false;

      client.on('http response', function(res) {
        res.should.be.instanceof(http.IncomingMessage);
        hasFired = true;
      });

      client.request('add', [9, 4], function(err, response) {
        if(err) return done(err);
        hasFired.should.be.ok;
        done();
      });
    });

    it('should accept a URL string as the first argument', function() {
      var urlStr = 'https://localhost:3000';
      var client = jayson.client.https(urlStr);
      var urlObj = url.parse(urlStr);
      Object.keys(urlObj).forEach(function(key) {
        client.options.should.have.property(key, urlObj[key]);
      });
    });

  });

});
