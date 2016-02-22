var should = require('should');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var suites = require(__dirname + '/support/suites');

describe('Jayson.Client', function() {

  it('should return an instance without using "new"', function() {
    var client = jayson.client(jayson.server());
    client.should.be.instanceof(jayson.client);
  });

  it('should return a raw request if not passed a server', function() {
    var client = new jayson.Client();
    var request = client.request('add', [11, 9]);
    should.exist(request);
    request.should.have.property('method', 'add');
    request.should.have.property('id');
    request.should.have.property('params', [11, 9]);
    request.should.have.property('jsonrpc', '2.0');
  });

  it('should return a raw request without a version 2 jsonrpc field if client is version 1', function() {
    var client = new jayson.Client({version: 1});
    var request = client.request('add', [11, 9]);
    should.exist(request);
    request.should.not.have.property('jsonrpc');
  });

  describe('instance', function() {
    
    var server = jayson.Server(support.server.methods, support.server.options);
    var client = jayson.client(server, support.server.options);

    describe('common tests', suites.getCommonForClient(client));

    it('should not talk to a version 2.0 server when client is 1.0', function(done) {
      client.options.version = 1; // change option

      client.request('add', [11, 9], function(err, response) {
        if(err) return done(err);
        should.not.exist(response.result);
        response.should.containDeep({error: {code: -32600}}); // "Request Error"
        client.options.version = 2; // reset option
        done();
      });
    });

    it('should return the response as received if given a callback with length 2', function(done) {
      client.request('add', [11, 12], function(err, response) {
        if(err) return done(err);
        arguments.length.should.equal(2);
        response.should.containDeep({result: 11 + 12});
        done();
      });
    });

    it('should split out a response when given a length 3 callback', function(done) {
      client.request('add', [4, 3], function(err, error, result) {
        if(err) return done(err);
        should(error).not.exist;
        should(result).exist;
        result.should.equal(4 + 3);
        done();
      });
    });

    it('should out an error when given a length 3 callback', function(done) {
      client.request('error', [], function(err, error, result) {
        if(err) return done(err);
        should(error).exist;
        error.should.have.property('code', -1000);
        should(result).not.exist;
        done();
      });
    });

    describe('_parseResponse', function() {

      it('should correctly split an ambiguous error response', function(done) {
        var response = {
          error: null, // should not be here
          result: 5
        };
        client._parseResponse(null, response, function(err, error, response) {
          if(err) return done(err);
          should(error).equal(null);
          should(response).equal(5);
          done();
        });
      });

      it('should send both error and response as is if ambiguous', function(done) {
        var response = {
          error: {code: 10000}, // missing message
          result: 2 // should not be here
        };
        client._parseResponse(null, response, function(err, error, response) {
          if(err) return done(err);
          should(error).have.property('code', 10000);
          should(response).equal(2);
          done();
        });
      });
    
    });

    it('should support specifying a request id generator', function(done) {

      var ordinal = 0;
      client.options.generator = function(request) { return ordinal++; };

      client.request('add', [9, 2], function(err, response) {
        if(err) return done(err);
        response.should.containDeep({
          id: 0,
          result: 9 + 2
        });
        ordinal.should.equal(1);
        delete client.options.generator; // remove option
        done();
      });

    });

    it('should emit "request" when a request is dispatched', function(done) {
      var hasFired = false;

      client.once('request', function(request) {
        hasFired = true;
        request.should.containDeep({params: [6, 9]});
      });

      client.request('add', [6, 9], function(err) {
        if(err) return done(err);
        hasFired.should.equal(true);
        done();
      });
    });

    it('should emit "response" when a response is received', function(done) {
      var hasFired = false;

      client.once('response', function(request, response) {
        hasFired = true;
        request.should.containDeep({params: [5, 8]});
        response.should.containDeep({result: 5 + 8});
      });

      client.request('add', [5, 8], function(err) {
        if(err) return done(err);
        hasFired.should.equal(true);
        done();
      });
    });

    it('should be able to execute a notification request', function(done) {
      client.request('add', [3, 4], null, function(err, response) {
        if(err) return done(err);
        arguments.length.should.equal(0);
        should.not.exist(response);
        done();
      });
    });

    it('should be able to execute a named-parameter request', function(done) {
      client.request('add', {a: 5, b: -2}, function(err, error, response) {
        if(err) return done(err);
        should.not.exist(error);
        response.should.equal(5 - 2);
        done();
      });
    });

    describe('batch requests', function() {

      it('should execute a simple batch', function(done) {

        var batch = [
          client.request('add', [1, 1]),
          client.request('add', [-1, -1]),
          client.request('add', [16, 4]),
        ];

        client.request(batch, function(err, responses) {
          if(err) return done(err);

          responses.should.be.instanceof(Array).and.have.length(3);

          responses.forEach(function(response, index) {
            var params = batch[index].params;
            should.exist(response.result);
            response.result.should.equal(params[0] + params[1]);
          });

          done();
        });
      });

      it('should propagate errors', function(done) {

        var batch = [
          client.request('add', [5, 10]),
          client.request('add', [6, 2], null), // notification
          client.request('does_not_exist', [])
        ];

        client.request(batch, function(err, responses) {
          if(err) return done(err);

          responses.should.be.instanceof(Array).and.have.length(2);

          responses[0].should.containDeep({
            result: 5 + 10
          });

          responses[1].should.containDeep({
            error: {code: -32601} // "Method not found"
          });

          done();
        });
      });

      it('should split errors and responses when given a length 3 callback', function(done) {

        var batch = [
          client.request('add', [12, 13]),
          client.request('add', [6, 2], null), // notification
          client.request('does_not_exist', [])
        ];

        client.request(batch, function(err, errors, successes) {
          if(err) return done(err);

          errors.should.be.instanceof(Array).and.have.length(1);
          successes.should.be.instanceof(Array).and.have.length(1);

          errors[0].should.containDeep({
            error: {code: -32601} // Method not found
          });

          successes[0].should.containDeep({
            result: 12 + 13
          });

          done();
        });
      });

      it('should not callback anything when given only notifications', function(done) {

        var batch = [
          client.request('add', [5, 2], null),
          client.request('add', [7, 6], null)
        ];

        client.request(batch, function(err, response) {
          if(err) return done(err);
          should.not.exist(response);
          done();
        });
      });

    });

  });

});
