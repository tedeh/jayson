var should = require('should');
var jayson = require(__dirname + '/..');
var support = require(__dirname + '/support/client-server');

describe('jayson client object', function() {

  var client;

  it('should return an instance without using "new"', function() {
    (function() {
      client = jayson.client(jayson.server());
    }).should.not.throw();
    client.should.be.instanceof(jayson.client);
  });

  it('should return a raw request if not passed a server', function() {
    (function() {
      var request = client.request('add', [11, 9]);
      should.exist(request);
      should.exist(request.method);
      should.exist(request.id);
      should.exist(request.params);
      should.exist(request.jsonrpc);
      request.jsonrpc.should.equal('2.0');
    }).should.not.throw();
  });

  it('should return a raw request without a version 2 jsonrpc field if client is version 1', function() {
    (function() {
      client.options.version = 1;
      var request = client.request('add', [11, 9]);
      should.exist(request);
      should.exist(request.method);
      should.exist(request.id);
      should.exist(request.params);
      should.not.exist(request.jsonrpc);
      client.options.version = 2;
    }).should.not.throw();
  });

});

describe('jayson client instance', function() {
  
  var server, client, context = {};

  beforeEach(function() {
    server = context.server = jayson.server(support.methods, support.options);
    client = context.client = jayson.client(server, support.options);
  });

  it('should be an instance of jayson.client', support.clientInstance(context));

  it('should be able to request a success-method on the server', support.clientRequest(context));

  it('should be able to request an error-method on the server', support.clientError(context));

  it('should support reviving and replacing', support.clientReviveReplace(context));

  it('should not talk to a version 2.0 server when client is 1.0', function(done) {
    client.options.version = 1;
    var a = 11, b = 9;
    client.request('add', [a, b], function(err, response) {
      should.not.exist(err);
      should.not.exist(response.result);
      should.exist(response.error);
      should.exist(response.error.code);
      response.error.code.should.equal(-32600); // "Request Error"
      done();
    });
    client.options.version = 2;
  });

  it('should return the response as received if given a callback with arity 2', function(done) {
    var a = 11, b = 9;
    client.request('add', [a, b], function(err, response) {
      arguments.length.should.equal(2);
      should.not.exist(err);
      should.exist(response);
      should.exist(response.result);
      response.result.should.equal(a + b);
      done();
    });
  });

  it('should support specifying a request id generator', function(done) {
    var ordinal = 0, a = 9, b = 2;
    client.options.generator = function(request) { return ordinal++; };
    client.request('add', [a, b], function(err, response) {
      should.not.exist(err);
      should.exist(response);
      response.should.have.property('result', a + b);
      response.should.have.property('id', 0);
      ordinal.should.equal(1);
      delete client.options.generator;
      done();
    });
  });

  it('should emit "request" when a request is dispatched', function(done) {
    var a = 6, b = 9, hasFired = false;
    client.once('request', function(request) {
      hasFired = true;
      should.exist(request);
      request.params.should.include(a).and.include(b).and.have.lengthOf(2);
    });
    client.request('add', [a, b], function(err) {
      if(err) return done(err);
      hasFired.should.be.ok;
      done();
    });
  });

  it('should emit "response" when a response is received', function(done) {
    var a = 8, b = 10, hasFired = false;
    client.once('response', function(request, response) {
      hasFired = true;
      should.exist(request);
      request.params.should.include(a).and.include(b).and.have.lengthOf(2);
      should.exist(response);
      response.should.have.property('result', a + b);
    });
    client.request('add', [a, b], function(err) {
      if(err) return done(err);
      hasFired.should.be.ok;
      done();
    });
  });

  it('should be able to execute a notification request', function(done) {
    var a = 3, b = 4;
    client.request('add', [a, b], null, function(err, response) {
      arguments.length.should.equal(0);
      should.not.exist(err);
      should.not.exist(response);
      done();
    });
  });

  it('should be able to execute a named-parameter request', function(done) {
    var params = {a: 5, b: -2};
    client.request('add', params, function(err, error, response) {
      should.not.exist(err);
      should.not.exist(error);
      should.exist(response);
      response.should.be.a('number').and.equal(params.a + params.b);
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
        should.not.exist(err);
        should.exist(responses);
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
        should.not.exist(err);
        should.exist(responses);
        responses.should.be.instanceof(Array).and.have.length(2);
        should.exist(responses[0]);
        should.exist(responses[0].result);
        responses[0].result.should.equal(batch[0].params[0] + batch[0].params[1]);
        should.exist(responses[1]);
        should.exist(responses[1].error);
        should.exist(responses[1].error.code);
        responses[1].error.code.should.equal(-32601); // Method not found
        done();
      });
    });

    it('should split errors and successes when given a three-paramed callback', function(done) {
      var batch = [
        client.request('add', [12, 13]),
        client.request('add', [6, 2], null), // notification
        client.request('does_not_exist', [])
      ];
      client.request(batch, function(err, errors, successes) {
        should.not.exist(err);
        should.exist(errors);
        should.exist(successes);
        errors.should.be.instanceof(Array).and.have.length(1);
        successes.should.be.instanceof(Array).and.have.length(1);
        should.exist(successes[0]);
        should.exist(successes[0].result);
        successes[0].result.should.equal(batch[0].params[0] + batch[0].params[1]);
        should.exist(errors[0]);
        should.exist(errors[0].error);
        should.exist(errors[0].error.code);
        errors[0].error.code.should.equal(-32601); // Method not found
        done();
      });
    });

    it('should not callback anything when given only notifications', function(done) {
      var batch = [
        client.request('add', [5, 2], null),
        client.request('add', [7, 6], null)
      ];
      client.request(batch, function(err, response) {
        should.not.exist(err);
        should.not.exist(response);
        done();
      });
    });

  });

});
