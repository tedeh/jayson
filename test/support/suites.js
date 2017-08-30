var should = require('should');
var support = require('./');
var jayson = require('./../../');
var Counter = support.Counter;
var http = require('http');

/**
 * Get a mocha suite for common test cases for a client
 * @param {Client} Client instance to use
 * @return {Function}
 */
exports.getCommonForClient = function(client) {

  return function() {

    it('should be an instance of jayson.Client', function() {
      client.should.be.instanceof(jayson.Client);
    });

    it('should be able to request a success-method on the server', function(done) {
      var a = 11, b = 12;
      client.request('add', [a, b], function(err, error, result) {
        if(err || error) return done(err || error);
        should.exist(result);
        result.should.equal(a + b);
        done();
      });
    });

    it('should be able to request an error-method on the server', function(done) {
      client.request('error', [], function(err, error, result) {
        if(err) return done(err);
        should.not.exist(result);
        should.exist(error);
        error.should.have.property('message', 'An error message');
        error.should.have.property('code', -1000);
        done();
      });
    });

    it('should support reviving and replacing', function(done) {
      var a = 2, b = 1;
      var instance = new Counter(a);
      client.request('incrementCounterBy', [instance, b], function(err, error, result) {
        should.not.exist(err);
        should.not.exist(error);
        should.exist(result);
        result.should.be.instanceof(Counter).and.not.equal(instance, 'not the same object');
        result.should.have.property('count', a + b);
        done();
      });
    });

    it('should be able to handle a notification', function(done) {
      client.request('add', [3, 4], null, function(err) {
        if(err) return done(err);
        arguments.length.should.equal(0);
        done();
      });
    });

    it('should be able to handle a batch request', function(done) {
      var batch = [
        client.request('add', [4, 9]),
        client.request('add', [10, 22])
      ];
      client.request(batch, function(err, responses) {
        should.not.exist(err);
        should.exist(responses);
        responses.should.be.instanceof(Array).and.have.length(2);
        responses[0].result.should.equal(4 + 9);
        responses[1].result.should.equal(10 + 22);
        done();
      });
    });

  };
};

/**
 * Get a mocha suite for common test cases for a HTTP client
 * @param {Client} client Client instance to use
 * @return {Function}
 */
exports.getCommonForHttpClient = function(client) {
  return function() {

    it('should emit an event with the http request', function(done) {
      var hasFired = false;
      client.once('http request', function(req) {
        req.should.be.instanceof(http.ClientRequest);
        hasFired = true;
      });

      client.request('add', [10, 2], function(err, response) {
        if(err) return done(err);
        hasFired.should.equal(true);
        done();
      });
    });

    it('should emit an event with the http response', function(done) {
      var hasFired = false;
      client.once('http response', function(res) {
        res.should.be.instanceof(http.IncomingMessage);
        hasFired = true;
      });

      client.request('add', [9, 4], function(err, response) {
        if(err) return done(err);
        hasFired.should.equal(true);
        done();
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
  
  };
};

/**
 * Get a mocha suite for common test cases for a HTTP server
 * @param {HttpServer} server
 * @param {Client} client Client instance coupled to the server
 * @return {Function}
 */
exports.getCommonForHttpServer = function(server, client) {
  return function() {

    it('should emit an event with the http request', function(done) {
      var hasFired = false;

      server.once('http request', function(req) {
        hasFired = true;
        req.should.be.instanceof(http.IncomingMessage);
      });

      client.request('add', [9, 4], function(err, response) {
        if(err) return done(err);
        hasFired.should.equal(true);
        done();
      });
    });

    it('should emit an event with the http response', function(done) {
      var hasFired = false;

      server.once('http response', function(res, req) {
        hasFired = true;
        req.should.be.instanceof(http.IncomingMessage);
        res.should.be.instanceof(http.ServerResponse);
      });

      client.request('add', [9, 4], function(err, response) {
        if(err) return done(err);
        hasFired.should.equal(true);
        done();
      });
    });
  
  };
};
