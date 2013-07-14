var should = require('should');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var ServerErrors = jayson.Server.errors;
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

  var server;

  beforeEach(function() {
    server = jayson.server(support.server.methods, support.server.options);
  });

  it('should allow a method to be added and removed', function() {
    var methodName = 'subtract';
    server.hasMethod(methodName).should.be.false;
    server.method(methodName, function(a, b, callback) {
      callback(null, a - b);
    });
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

    var requestEventRequest = utils.request('add', [9, 2], 'test_request_event_id');
    it('should emit "request" upon a request', reqShouldEmit(requestEventRequest, 'request', function(req) {
      should.exist(req);
      req.id.should.equal(requestEventRequest.id);
    }));

    var responseEventRequest = utils.request('add', [5, 2], 'test_response_event_id');
    it('should emit "response" upon a response', reqShouldEmit(responseEventRequest, 'response', function(req, res) {
      should.exist(req);
      should.exist(res);
      req.id.should.equal(responseEventRequest.id);
      res.result.should.equal(5 + 2);
    }));

    var batchEventRequests = [utils.request('add', [5, 2], 'test_batch_event_id')];
    it('should emit "batch" upon a batch request', reqShouldEmit(batchEventRequests, 'batch', function(batch) {
      should.exist(batch);
      batch.should.be.instanceof(Array).and.have.length(1);
      batch[0].id.should.equal(batchEventRequests[0].id);
    }));

  });

  describe('invalid request with wrong format', function() {

    var request = 'I am a completely invalid request';
    it('should callback a "Parse Error"', reqShouldBeErrorCode(request, ServerErrors.PARSE_ERROR));

  });

  describe('invalid request with an erroneous "jsonrpc"-property', function() {

    var requestInvalidVersion = utils.request('add', []);
    requestInvalidVersion.jsonrpc = '1.0';
    it('should callback a "Request Error" by having a wrong value', reqShouldBeErrorCode(requestInvalidVersion, ServerErrors.INVALID_REQUEST));

    var requestNoProperty = utils.request('add', []);
    delete requestNoProperty.jsonrpc;
    it('should callback a "Request Error" by being non-existent', reqShouldBeErrorCode(requestNoProperty, ServerErrors.INVALID_REQUEST));

  });

  describe('invalid request with an erroneous "method"-property', function() {

    var requestInvalidMethod = utils.request('add', []);
    requestInvalidMethod.method = true;
    it('should callback with a "Request Error" if it is of the wrong type', reqShouldBeErrorCode(requestInvalidMethod, ServerErrors.INVALID_REQUEST));

    var requestNoMethod = utils.request('add', []);
    requestNoMethod.method = 'subtract';
    it('should callback with a "Method Not Found" if it refers to a non-existing method', reqShouldBeErrorCode(requestNoMethod, ServerErrors.METHOD_NOT_FOUND)); 

  });

  describe('invalid request with an erroneous "id"-property', function() {

    var requestInvalidId = utils.request('add', []);
    requestInvalidId.id = true;
    it('should callback with a "Request Error" if it is of the wrong type', reqShouldBeErrorCode(requestInvalidId, ServerErrors.INVALID_REQUEST));

    var requestNoIdInvalid = utils.request('add', []);
    delete requestNoIdInvalid.id;
    requestNoIdInvalid = JSON.stringify(requestNoIdInvalid).slice(0, requestNoIdInvalid.length - 5);
    it('should callback with the "id"-property set to null if it is non-interpretable', reqShouldBeError(requestNoIdInvalid, function(err) {
      should.strictEqual(err.id, null);
    }));

    var requestNoId = utils.request('add', [1, 2]);
    delete requestNoId.id;
    it('should callback empty if the request is interpretable', reqShouldBeEmpty(requestNoId));

  });

  describe('invalid request with wrong "params"', function() {
    
    var requestInvalidParams = utils.request('add', []);
    requestInvalidParams.params = '1';
    it('should callback with a "Request Error" if it is of the wrong type', reqShouldBeErrorCode(requestInvalidParams, ServerErrors.INVALID_REQUEST));

  });

  describe('request', function() {

    var simpleAddRequest = utils.request('add', [3, 9]);
    it('should return the expected result', reqShouldBeResult(simpleAddRequest, 3 + 9));

  });

  describe('request to a method that does not callback anything', function() {

    var emptyMethodRequest = utils.request('empty', [true]);
    it('should return a result regardless', reqShouldBe(emptyMethodRequest, function(err, res) {
      should.not.exist(err);
      should.exist(res);
      res.should.have.ownProperty('result');
    }));

  });

  describe('named parameters', function() {

    var namedParamsRequest = utils.request('add', {b: 2, a: 9});
    it('should return the expected result', reqShouldBeResult(namedParamsRequest, 9 + 2));

  });

  describe('notification requests', function() {

    var simpleNotificationRequest = utils.request('add', [3, -3], null);
    it('should handle a valid notification request', reqShouldBeEmpty(simpleNotificationRequest));

    var invalidNotificationRequest  = utils.request('subtract', [5, 7], null);
    it('should handle an erroneous notification request', reqShouldBeEmpty(invalidNotificationRequest));

  });

  describe('reviving and replacing', function() {

    var simpleInstanceRequestCounter = new support.Counter(5);
    var simpleInstanceRequest = utils.request('incrementCounterBy', [simpleInstanceRequestCounter, 5]);
    it('should be able to return the expected result', reqShouldBeResult(simpleInstanceRequest, function(res) {
      res.should.be.an.instanceof(support.Counter);
      res.count.should.equal(5 + 5);
    }));

  });

  describe('batch requests', function() {

    describe('with a version 1.0 server', function() {

      beforeEach(function() {
        server.options.version = 1;
      });

      var batchVersionRequests = [
        utils.request('add', [1, 1]),
        utils.request('add', [2, 2])
      ];
      it('should error when version is 1.0', reqShouldBeErrorCode(batchVersionRequests, ServerErrors.INVALID_REQUEST));
    
    });

    it('should handle an empty batch', reqShouldBeErrorCode([], ServerErrors.INVALID_REQUEST));

    it('should handle a batch with only invalid requests', reqShouldBe([1, 'a', true], function(err, response) {
      should.not.exist(err);
      response.should.be.instanceof(Array).and.have.length(3);
      response.forEach(function(response) {
        response.error.code.should.equal(ServerErrors.INVALID_REQUEST);
      });
    }));

    var onlyNotificationRequests = [
      utils.request('add', [3, 4], null),
      utils.request('add', [4, 5], null)
    ];
    it('should handle a batch with only notifications', reqShouldBeEmpty(onlyNotificationRequests));

    var mixedRequests = [
        utils.request('add', [1, 1], null),
        'invalid request',
        utils.request('add', [2, 2])
    ];
    it('should handle mixed requests', reqShouldBe(mixedRequests, function(err, responses) {
      should.not.exist(err);
      responses.should.be.instanceof(Array).and.have.length(2);
      should.exist(responses[0]);
      should.exist(responses[0].error);
      responses[0].error.should.have.property('code', ServerErrors.INVALID_REQUEST);
      should.exist(responses[1]);
      responses[1].should.have.property('result', 2 + 2);
    }));

    var mixedCallbackRequests = [ 
      utils.request('add_slow', [1, 1, true]),
      utils.request('add_slow', [1, 2, false])
    ];
    it('should be able return method invocations in correct order', reqShouldBe(mixedCallbackRequests, function(err, responses) {
      should.not.exist(err);
      should.exist(responses);
      responses.should.be.instanceof(Array).and.have.length(2);
      should.exist(responses[0]);
      should.exist(responses[0].result);
      responses[0].should.have.property('result', 2);
      should.exist(responses[1]);
      should.exist(responses[1].result);
      responses[1].should.have.property('result', 3);
    }));

  });

  // exec request, assert error, assert code
  function reqShouldBeErrorCode(request, code) {
    return reqShouldBeError(request, function(err) {
      err.error.should.have.property('code', code);
    });
  }

  // exec request, assert error, run validate
  function reqShouldBeError(request, validate) {
    return reqShouldBe(request, function(err, res) {
      should.exist(err);
      should.exist(err.error);
      should.not.exist(res);
      validate(err);
    });
  }

  // exec request, assert result not error, run/compare validate
  function reqShouldBeResult(request, validate) {
    return reqShouldBe(request, function(err, res) {
      should.not.exist(err);
      should.exist(res);
      should.exist(res.result);
      if(typeof(validate) === 'function') validate(res.result);
      else res.result.should.equal(validate);
    });
  }

  // exec request, assert no result, assert no error
  function reqShouldBeEmpty(request) {
    return reqShouldBe(request, function(err, res) {
      should.not.exist(err);
      should.not.exist(res);
    });
  }

  // exec request, run validate
  function reqShouldBe(request, validate) {
    return function(done) {
      server.call(request, function(err, res) {
        validate.apply(validate, arguments);
        done();
      });
    };
  }

  // add event handler, exec request, assert event handler ran
  function reqShouldEmit(request, name, handler) {
    return function(done) {
      server.once(name, function() {
        handler.apply(null, arguments);
        done();
      });
      server.call(request);
    };
  }

});
