var should = require('should');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support/client-server');
var utils = jayson.utils;

describe('jayson server object', function() {

  it('should have an object of errors', function() {
    jayson.server.should.have.property('errors');
  });

  it('should return an instance without using "new"', function() {
    var instance = jayson.server();
    instance.should.be.an.instanceof(jayson.server);
  });

});

describe('jayson server instance', function() {

  var server = jayson.server({
    add: function(a, b, callback) { callback(null, a + b); },
    add_slow: function(a, b, isSlow, callback) {
      if(!isSlow) return callback(null, a + b);
      setTimeout(callback.bind(callback, null, a + b), 15);
    }
  });

  it('should have the correct properties', function() {
    should.exist(server.method);
    server.method.should.be.a('function');
    should.exist(server.methods);
    server.methods.should.be.a('function');
    should.exist(server.call);
    server.call.should.be.a('function');
    should.exist(server.hasMethod);
    server.hasMethod.should.be.a('function');
    should.exist(server.removeMethod);
    server.removeMethod.should.be.a('function');
    should.exist(server.errorMessages);
    server.errorMessages.should.be.a('object');
  });

  it('should allow a method to be added and removed', function() {
    var methodName = 'subtract';
    server.hasMethod(methodName).should.be.false;
    (function() {
      server.method(methodName, function(a, b, callback) {
        callback(null, a - b);
      });
    }).should.not.throw();
    server.hasMethod(methodName).should.be.true;
    server.removeMethod(methodName);
    server.hasMethod(methodName).should.be.false;
  });

  it('should not allow a method with a reserved name to be added', function() {
    var methodName = 'rpc.test';
    server.hasMethod(methodName).should.be.false;
    (function() {
      server.method(methodName, function(a, b, callback) {
        callback(null, a - b);
      });
    }).should.throw();
    server.hasMethod(methodName).should.be.false;
  });

  it('should not allow a method with an invalid name to be added', function() {
    var methodName = '';
    server.hasMethod(methodName).should.be.false;
    (function() {
      server.method(methodName, function(a, b, callback) {
        callback(null, a - b);
      });
    }).should.throw();
    server.hasMethod(methodName).should.be.false;
  });

  it('should allow standard error messages to be changed', function(done) {
    var newMsg = 'Parse Error!';
    server.errorMessages[jayson.server.errors.PARSE_ERROR] = newMsg;
    server.call('invalid request', function(err, response) {
      should.exist(err);
      should.exist(err.error);
      should.not.exist(response);
      err.error.code.should.equal(jayson.server.errors.PARSE_ERROR);
      err.error.message.should.be.a('string').and.equal(newMsg);
      done();
    });
  });

  describe('event handlers', function() {

    it('should emit "request" upon a request', function(done) {
      var id = 'a_testy_id';
      var params = [9, 2];
      var method = 'add';
      var request = utils.request(method, params, id);
      server.once('request', function(request) {
        should.exist(request);
        request.id.should.equal(id);
        request.params.should.equal(params);
        request.method.should.equal(method);
        done();
      });
      server.call(request);
    });

    it('should emit "response" upon a response', function(done) {
      var a = 5, b = 2;
      var id = 'another_testy_id';
      var params = [a, b];
      var method = 'add';
      var request = utils.request(method, params, id);
      server.once('response', function(request, response) {
        should.exist(request);
        request.id.should.equal(id);
        request.params.should.equal(params);
        request.method.should.equal(method);
        should.exist(response);
        response.result.should.equal(a + b);
        done();
      });
      server.call(request);
    });

  });

  describe('invalid request with wrong format', function() {

    var request = 'I am a completely invalid request';

    it('should not be parsable without throwing an error', function() {
      (function() {
        JSON.parse(request);
      }).should.throw();
    });

    it('should callback a "Parse Error"', function(done) {
      server.call(request, function(err, response) {
        should.exist(err);
        should.exist(err.error);
        should.exist(err.error.code);
        should.not.exist(response);
        err.error.code.should.equal(-32700); // "Parse Error"
        done();
      });
    });

  });

  describe('invalid request with wrong "jsonrpc"', function() {
    
    it('should callback a "Request Error" by having wrong value', function(done) {
      var request = utils.request('add', []);
      request.jsonrpc = '1.0';
      server.call(request, function(err, response) {
        should.exist(err);
        should.exist(err.error);
        should.exist(err.error.code);
        should.not.exist(response);
        err.error.code.should.equal(-32600); // "Request Error"
        done();
      });
    });

    it('should callback a "Request Error" by non-existent', function(done) {
      var request = utils.request('add', []);
      delete request.jsonrpc;
      server.call(request, function(err, response) {
        should.exist(err);
        should.exist(err.error);
        should.exist(err.error.code);
        should.not.exist(response);
        err.error.code.should.equal(-32600); // "Request Error"
        done();
      });
    });

  });

  describe('invalid request with wrong "method"', function() {
    
    it('should callback a "Request Error" if wrong type', function(done) {
      var request = utils.request('add', []);
      request.method = true;
      server.call(request, function(err, response) {
        should.exist(err);
        should.exist(err.error);
        should.exist(err.error.code);
        should.not.exist(response);
        err.error.code.should.equal(-32600); // "Request Error"
        done();
      });
    });

    it('should callback with a "Method Not Found" if non-existing method', function(done) {
      var request = utils.request('add', []);
      request.method = 'subtract';
      server.call(request, function(err, response) {
        should.exist(err);
        should.exist(err.error);
        should.exist(err.error.code);
        should.not.exist(response);
        err.error.code.should.equal(-32601); // "Method Not Found Error"
        done();
      });
    });

  });

  describe('invalid request with wrong "id"', function() {
    
    it('should callback a "Request Error" if wrong type', function(done) {
      var request = utils.request('add', []);
      request.id = true;
      server.call(request, function(err, response) {
        should.exist(err);
        should.exist(err.error);
        should.exist(err.error.code);
        should.not.exist(response);
        err.error.code.should.equal(-32600); // "Request Error"
        done();
      });
    });

  });

  describe('invalid request with wrong "params"', function() {
    
    it('should callback a "Request Error" if wrong type', function(done) {
      var request = utils.request('add', []);
      request.params = '1';
      server.call(request, function(err, response) {
        should.exist(err);
        should.exist(err.error);
        should.exist(err.error.code);
        should.not.exist(response);
        err.error.code.should.equal(-32600); // "Request Error"
        done();
      });
    });

  });

  describe('invalid request without "id"', function() {

    it('should error with id as null if not interpretable', function(done) {
      var request = utils.request('add', [2, 2]);
      // make invalid
      delete request.id;
      request = JSON.stringify(request);
      request = request.slice(0, request.length - 5);
      server.call(request, function(err, response) {
        should.exist(err);
        should.not.exist(response);
        err.should.have.ownProperty('id');
        should.strictEqual(err.id, null);
        done();
      });
    });

    it('should callback empty if request is interpretable', function(done) {
      var request = utils.request('add', [2, 2]);
      // make invalid
      delete request.id;
      server.call(request, function(err, response) {
        should.not.exist(err);
        should.not.exist(response);
        done();
      });
    });

  });

  describe('request', function() {

    it('should return the expected result', function(done) {
      var a = 3, b = 9;
      var request = utils.request('add', [a, b]);
      server.call(request, function(err, response) {
        should.not.exist(err);
        should.exist(response);
        should.exist(response.result);
        response.result.should.equal(a + b);
        done();
      });
    });

  });

  // TODO Needed?
  describe('request to a method that does not callback anything', function() {
    before(function() {
      server.method('empty', function(arg, callback) { callback(); })
    });

    it('should return a result regardless', function(done) {
      var request = utils.request('empty', [true]);
      server.call(request, function(err, response) {
        should.not.exist(err);
        should.exist(response);
        response.should.have.ownProperty('result');
        done();
      });
    });

    after(function() {
      server.removeMethod('empty');
    });
  });

  describe('named parameters', function() {

    it('should return the correct result', function(done) {
      var a = 9, b = 2;
      var request = utils.request('add', {a: 9, b: 2});
      server.call(request, function(err, response) {
        should.not.exist(err);
        should.exist(response);
        should.exist(response.result);
        response.result.should.equal(a + b);
        done();
      });
    });

  });

  describe('notification requests', function() {

    it('should handle a valid notification request', function(done) {
      var request = utils.request('add', [3, -3], null);
      server.call(request, function(err, response) {
        should.not.exist(err);
        should.not.exist(response);
        done();
      });
    });

    it('should handle an invalid notification request', function(done) {
      // non-existent method, should ignore
      var request = utils.request('subtract', [5, 7], null);
      server.call(request, function(err, result) {
        should.not.exist(err);
        should.not.exist(result);
        done();
      });
    });

  });

  describe('reviver and replacer', function() {

    var server = jayson.server(support.methods, support.options);

    it('should be able to an instantiated object', function(done) {
      var a = 4, b = -3;
      var counter = new support.Counter(a);
      var request = JSON.stringify(utils.request('incrementCounterBy', [counter, b]), support.options.replacer);
      server.call(request, function(err, response) {
        should.not.exist(err);
        should.exist(response);
        should.exist(response.result);
        response.result.should.be.an.instanceof(support.Counter);
        response.result.count.should.equal(a + b);
        done();
      });
    });

  });

  describe('batch requests', function() {

    it('should handle an empty batch', function(done) {
      server.call([], function(err, response) {
        should.not.exist(response);
        should.exist(err);
        should.exist(err.error);
        should.exist(err.error.code);
        err.error.code.should.equal(-32600);
        done();
      });
    });

    it('should handle a batch with only invalid requests', function(done) {
      server.call([1, 2, 3], function(err, response) {
        should.not.exist(err);
        should.exist(response);
        response.should.be.instanceof(Array).and.have.length(3);
        response.forEach(function(response) {
          should.exist(response);
          should.exist(response.error);
          should.exist(response.error.code);
          response.error.code.should.equal(-32600);
        });
        done();
      });
    });

    it('should handle a batch with only notifications', function(done) {
       var requests = [
        utils.request('add', [3, 4], null),
        utils.request('add', [4, 5], null)
      ];
      server.call(requests, function(err, responses) {
        should.not.exist(err);
        should.not.exist(responses);
        done();
      });
    });

    it('should handle mixed requests', function(done) {
      var requests = [
        utils.request('add', [1, 1], null),
        'invalid request',
        utils.request('add', [2, 2])
      ];
      server.call(requests, function(err, responses) {
        should.not.exist(err);
        should.exist(responses);
        responses.should.be.instanceof(Array).and.have.length(2);
        should.exist(responses[0]);
        should.exist(responses[0].error);
        should.exist(responses[0].error.code);
        should.exist(responses[1]);
        should.exist(responses[1].result);
        responses[0].error.code.should.equal(-32600);
        responses[1].result.should.equal(2 + 2);
        done();
      });
    });

    it('should be able return method invocations in correct order', function(done) {
      var requests = [
        utils.request('add_slow', [1, 1, true]),
        utils.request('add_slow', [1, 2, false])
      ];
      server.call(requests, function(err, responses) {
        should.not.exist(err);
        should.exist(responses);
        responses.should.be.instanceof(Array);
        responses.should.have.length(2);
        should.exist(responses[0]);
        should.exist(responses[0].result);
        should.exist(responses[1]);
        should.exist(responses[1].result);
        responses[0].result.should.equal(2);
        responses[1].result.should.equal(3);
        done();
      });
    });
  });

});
