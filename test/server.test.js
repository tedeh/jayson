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

  // change server instance error message, request erroring method, assert error message changed
  it('should allow standard error messages to be changed', function(done) {
    var newMsg = server.errorMessages[jayson.server.errors.PARSE_ERROR] = 'Parse Error!';
    server.call('invalid request', function(err, response) {
      should.exist(err);
      should.exist(err.error);
      should.not.exist(response);
      err.error.should.have.property('code', jayson.server.errors.PARSE_ERROR);
      err.error.should.have.property('message', newMsg);
      done();
    });
  });

  describe('error()', function() {

    it('should not make an error out of an invalid code', function() {
      var error = server.error('invalid_code');
      should.exist(error);
      error.should.have.property('code', jayson.Server.errors.INTERNAL_ERROR);
    });

    it('should fill in the error message if not passed one', function() {
      var code = jayson.Server.errors.INVALID_PARAMS;
      var error = server.error(code);
      should.exist(error);
      error.should.have.property('code', code);
      error.should.have.property('message', jayson.Server.errorMessages[code]);
    });

    it('should add a data member if specified', function() {
      var data = {member: 1};
      var code = jayson.Server.errors.INVALID_PARAMS;
      var error = server.error(code, null, data);
      error.should.have.property('data', data);
    });
  
  });

  describe('event handlers', function() {

    (function() {

      var request = utils.request('add', [9, 2], 'test_request_event_id');
      it('should emit "request" upon a request', reqShouldEmit(request, 'request', function(req) {
        should.exist(req);
        req.id.should.equal(request.id);
      }));

    }());

    (function() {

      var request = utils.request('add', [5, 2], 'test_response_event_id');
      it('should emit "response" upon a response', reqShouldEmit(request, 'response', function(req, res) {
        should.exist(req);
        should.exist(res);
        req.id.should.equal(request.id);
        res.result.should.equal(5 + 2);
      }));

    }());

    (function() {

      var request = [utils.request('add', [5, 2], 'test_batch_event_id')];
      it('should emit "batch" upon a batch request', reqShouldEmit(request, 'batch', function(batch) {
        should.exist(batch);
        batch.should.be.instanceof(Array).and.have.length(1);
        batch[0].id.should.equal(request[0].id);
      }));

    }());

  });

  describe('invalid request with wrong format', function() {

    (function() {

      var request = 'I am a completely invalid request';
      it('should callback a "Parse Error"', reqShouldBeErrorCode(request, ServerErrors.PARSE_ERROR));

    }());

  });

  describe('invalid request with an erroneous "jsonrpc"-property', function() {

    (function() {

      var request = utils.request('add', []);
      request.jsonrpc = '1.0';
      it('should callback a "Request Error" by having a wrong value', reqShouldBeErrorCode(request, ServerErrors.INVALID_REQUEST));

    }());

    (function() {

      var request = utils.request('add', []);
      delete request.jsonrpc;
      it('should callback a "Request Error" by being non-existent', reqShouldBeErrorCode(request, ServerErrors.INVALID_REQUEST));

    }());

  });

  describe('invalid request with an erroneous "method"-property', function() {

    (function() {

      var request = utils.request('add', []);
      request.method = true;
      it('should callback with a "Request Error" if it is of the wrong type', reqShouldBeErrorCode(request, ServerErrors.INVALID_REQUEST));

    }());

    (function() {

      var request = utils.request('add', []);
      request.method = 'subtract';
      it('should callback with a "Method Not Found" if it refers to a non-existing method', reqShouldBeErrorCode(request, ServerErrors.METHOD_NOT_FOUND)); 

    }());

  });

  describe('invalid request with an erroneous "id"-property', function() {

    (function() {

      var request = utils.request('add', []);
      request.id = true;
      it('should callback with a "Request Error" if it is of the wrong type', reqShouldBeErrorCode(request, ServerErrors.INVALID_REQUEST));

    }());

    (function() {

      var request = utils.request('add', []);
      delete request.id;
      request = JSON.stringify(request).slice(0, request.length - 5);
      it('should callback with the "id"-property set to null if it is non-interpretable', reqShouldBeError(request, function(err) {
        should.strictEqual(err.id, null);
      }));

    }());

    (function() {

      var request = utils.request('add', [1, 2]);
      delete request.id;
      it('should callback empty if the request is interpretable', reqShouldBeEmpty(request));

    }());

  });

  describe('invalid request with wrong "params"', function() {

    (function() {

      var request = utils.request('add', []);
      request.params = '1';
      it('should callback with a "Request Error" if it is of the wrong type', reqShouldBeErrorCode(request, ServerErrors.INVALID_REQUEST));

    }());

  });

  describe('request', function() {

    (function() {

      var request = utils.request('add', [3, 9]);
      it('should return the expected result', reqShouldBeResult(request, 3 + 9));

    })()

  });

  describe('nested requests', function() {
    (function() {
      var request = utils.request('Math.subtract', [3, 9]);
      it('should return the expected result', reqShouldBeResult(request, 3 - 9));
    })();

    (function() {
      var request = utils.request('Doubly.Nested.multiply', [3, 9]);
      it('should work for multiple levels of nesting', reqShouldBeResult(request, 3 * 9));
    })();
  })

  describe('request to a method that does not callback anything', function() {

    var emptyMethodRequest = utils.request('empty', [true]);
    it('should return a result regardless', reqShouldBe(emptyMethodRequest, function(err, res) {
      should.not.exist(err);
      should.exist(res);
      res.should.have.ownProperty('result');
    }));

  });

  describe('named parameters', function() {

    (function() {

      var request = utils.request('add', {b: 2, a: 9});
      it('should return as expected', reqShouldBeResult(request, 9 + 2));

    })();

    (function() {

      var request = utils.request('add', {});
      it('should not fail when not given sufficient arguments', reqShouldBeResult(request, function(result) {
        isNaN(result).should.be.true;
      }));

    })();


  });

  describe('notification requests', function() {

    (function() {
    
      var request = utils.request('add', [3, -3], null);
      it('should handle a valid notification request', reqShouldBeEmpty(request));

    })();

    (function() {

      var request  = utils.request('subtract', [5, 7], null);
      it('should handle an erroneous notification request', reqShouldBeEmpty(request));

    })();

  });

  describe('reviving and replacing', function() {

    (function() {

      var counter = new support.Counter(5);
      var request = utils.request('incrementCounterBy', [counter, 5]);

      it('should be able to return the expected result', reqShouldBeResult(request, function(res) {
        res.should.be.an.instanceof(support.Counter);
        res.count.should.equal(5 + 5);
      }));

    })();

  });

  describe('batch requests', function() {

    describe('with a version 1.0 server', function() {

      beforeEach(function() {
        server.options.version = 1;
      });

      (function() {

        var request = [
          utils.request('add', [1, 1]),
          utils.request('add', [2, 2])
        ];

        it('should error when version is 1.0', reqShouldBeErrorCode(request, ServerErrors.INVALID_REQUEST));

      })();
    
    });

    it('should handle an empty batch', reqShouldBeErrorCode([], ServerErrors.INVALID_REQUEST));

    it('should handle a batch with only invalid requests', reqShouldBe([1, 'a', true], function(err, response) {
      should.not.exist(err);
      response.should.be.instanceof(Array).and.have.length(3);
      response.forEach(function(response) {
        response.error.code.should.equal(ServerErrors.INVALID_REQUEST);
      });
    }));

    (function() {

      var request = [
        utils.request('add', [3, 4], null),
        utils.request('add', [4, 5], null)
      ];

      it('should handle a batch with only notifications', reqShouldBeEmpty(request));

    })();

    (function() {

      var request = [
        utils.request('add', [1, 1], null),
        'invalid request',
        utils.request('add', [2, 2])
      ];

      it('should handle mixed requests', reqShouldBe(request, function(err, responses) {
        should.not.exist(err);
        responses.should.be.instanceof(Array).and.have.length(2);
        should.exist(responses[0]);
        should.exist(responses[0].error);
        responses[0].error.should.have.property('code', ServerErrors.INVALID_REQUEST);
        should.exist(responses[1]);
        responses[1].should.have.property('result', 2 + 2);
      }));

    })();

    (function() {

      var request = [ 
        utils.request('add_slow', [1, 1, true]),
        utils.request('add_slow', [1, 2, false])
      ];

      it('should be able return method invocations in correct order', reqShouldBe(request, function(err, responses) {
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

    })();

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
      if(typeof(validate) === 'function') return validate(res.result);
      res.should.have.property('result', validate);
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
