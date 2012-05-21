var assert = require('assert');
var should = require('should');

var jayson = require(__dirname + '/../');
var Server = jayson.server;
var utils = jayson.utils;

describe('The Server', function() {
  it('should have an object of errors', function() {
    Server.should.have.property('errors');
  });
});

describe('The Server Constructor', function() {
  var ctor = jayson.server;
  it('should invoked without "new" return the correct instance anyway', function() {
    var instance = new ctor();
    instance.should.be.an.instanceof(jayson.server);
  });
})
  
// main instance of server
var server = new Server({
  add: function(a, b, callback) { callback(null, a + b); },
  divide: function(a, b, callback) { callback(null, a / b); }
});

describe('An instance of the server', function() {

  var server = new Server();

  it('should have the correct methods', function() {
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
    server.errorMessages[Server.errors.PARSE_ERROR] = newMsg;
    server.call('invalid request', function(err, result) {
      shouldBeValidError(err);
      should.not.exist(result)
      err.error.code.should.equal(Server.errors.PARSE_ERROR);
      err.error.message.should.be.a('string').and.equal(newMsg);
      done();
    });
  });
});

describe('An invalid JSON object', function() {
  var request = 'I am an invalid JSON string';

  it('should not be parsable without throwing an error', function() {
    (function() {
      JSON.parse(request);
    }).should.throw();
  });

  it('used in a request should callback with a Parse Error', shouldBeError(server, request, -32700));

});

describe('A request with a "jsonrpc"-property that is faulty', function() {
  describe('by being non-existant', function() {
    var request = getValidRequest();
    delete request.jsonrpc;
    it('should used in a request callback with a Request Error', shouldBeError(server, request, -32600));
  });

  describe('by being of the wrong value', function() {
    var request = getValidRequest();
    request.jsonrpc = "1.0";
    it('should used in a request callback with a Request Error', shouldBeError(server, request, -32600));
  });

});

describe('A request with a "method"-property that is faulty', function() {
  describe('by being of the wrong type', function() {
    var request = getValidRequest();
    request.method = true;
    it('should used in a request callback with a Request Error', shouldBeError(server, request, -32600));
  });

  describe('by referring to a nonexistent method', function() {
    var request = getValidRequest();
    request.method = "subtract";
    it('should used in a request callback with a Method Not Found Error', shouldBeError(server, request, -32601));
  });
});

describe('A request with the "id"-property being faulty', function() {
  describe('by being of the wrong type', function() {
    var request = getValidRequest();
    request.id = true;
    it('should used in a request callback with a Request Error', shouldBeError(server, request, -32600));
  });
});

describe('A request with the "params"-property being faulty', function() {
  describe('by being of the wrong type', function() {
    var request = getValidRequest();
    request.params = "1";
    it('should used in a request callback with a Request Error', shouldBeError(server, request, -32600));
  });
});

describe('An invalid request without an "id"-property', function() {
  it('should return an error response with id as null if the request could not be interpreted', function(done) {
    var request = getValidRequest();
    delete request.id;
    request = JSON.stringify(request);
    request = request.slice(0, request.length - 5);
    server.call(request, function(err, result) {
      shouldBeValidError(err);
      should.not.exist(result);
      assert(err.id === null);
      done();
    });
  });
  it('should return an empty response if the request could be interpreted', function(done) {
    var request = getValidRequest();
    delete request.id;
    request.method = 'subtract'; // Does not exist
    server.call(request, function(err, result) {
      should.not.exist(err);
      should.not.exist(result);
      done();
    });
  });
});

describe('A valid request to the "divide"-method with named parameters', function() {
  it('returns the correct value', function(done) {
    var request = getValidRequest();
    request.method = 'divide';
    request.params = {b: 3, a: 9};
    server.call(request, function(err, result) {
      should.not.exist(err);
      shouldBeValidResult(result);
      result.result.should.equal(9 / 3);
      done();
    });
  });
});

describe('A valid request to the "add"-method', function() {
  it('returns the sum of the passed parameters', function(done) {
    var request = getValidRequest();
    var expectedSum = request.params.reduce(function(curr, prev) { return curr + prev; }, 0);
    server.call(request, function(err, result) {
      should.not.exist(err);
      shouldBeValidResult(result);
      result.result.should.equal(expectedSum);
      done();
    });
  });
});

describe('A notification request', function() {
  describe('that is valid', function() {
    it('should callback empty', function(done) {
      var request = getValidRequest();
      delete request.id;
      server.call(request, function(err, result) {
        should.not.exist(err, result);
        done();
      });
    });
  });
  describe('that is invalid by being unparseable', function() {
    it('should callback with an Parse Error', function(done) {
      var request = 'completely invalid json';
      server.call(request, function(err, result) {
        should.not.exist(result);
        should.exist(err, err.id);
        shouldBeValidError(err);
        err.error.code.should.be.a('number').and.equal(-32700);
        should.equal(err.id, null);
        done();
      });
    });
  });
  describe('that is invalid by referring to a non-existent method', function() {
    it('should callback empty', function(done) {
      var request = utils.request('add', [5, 7], null);
      server.call(request, function(err, result) {
        should.not.exist(err, result);
        done();
      });
    });
  });
});

describe('a jayson server', function() {

  var server = jayson.server({
    add: function(a, b, callback) { callback(null, a + b); },
    add_slow: function(a, b, isSlow, callback) {
      if(!isSlow) return callback(null, a + b);
      setTimeout(callback.bind(callback, null, a + b), 15);
    }
  });

  describe('receiving batch requests', function() {

    // helper to create batches
    var client = jayson.client(server);

    it('should handle an empty batch', function(done) {
      server.call([], function(err, response) {
        should.not.exist(response);
        should.exist(err, err.error, err.error.code);
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
          should.exist(response, response.error, response.error.code);
          response.error.code.should.equal(-32600);
        });
        done();
      });
    });

    it('should handle a batch with only notifications', function(done) {
       var requests = [
        client.request('add', [3, 4], null),
        client.request('add', [4, 5], null)
      ];
      server.call(requests, function(err, responses) {
        should.not.exist(err, responses);
        done();
      });
    });

    it('should handle mixed requests', function(done) {
      var requests = [
        client.request('add', [1, 1], null),
        'invalid request',
        client.request('add', [2, 2])
      ];
      server.call(requests, function(err, responses) {
        should.not.exist(err);
        should.exist(responses);
        responses.should.be.instanceof(Array).and.have.length(2);
        should.exist(responses[0], responses[0].error, responses[0].error.code);
        should.exist(responses[1], responses[1].result);
        responses[0].error.code.should.equal(-32600);
        responses[1].result.should.equal(2 + 2);
        done();
      });
    });

    it('should be able return method invocations in correct order', function(done) {
      var requests = [
        client.request('add_slow', [1, 1, true]),
        client.request('add_slow', [1, 2, false])
      ];
      server.call(requests, function(err, responses) {
        should.not.exist(err);
        should.exist(responses);
        responses.should.be.instanceof(Array);
        responses.should.have.length(2);
        should.exist(responses[0], responses[0].result, responses[1], responses[1].result);
        responses[0].result.should.equal(2);
        responses[1].result.should.equal(3);
        done();
      });
    });
  });

});

// prepares a mock request to an "add"-method
function getValidRequest() {
  var params = [
    Math.round(Math.random() * 100),
    Math.round(Math.random() * 100)
  ]
  return utils.request('add', params);
}

function shouldBeValidResult(response) {
  should.exist(response, response.result);
  should.not.exist(response.error);
}

function shouldBeValidError(response) {
  should.exist(response, response.error);;
  should.not.exist(response.result)
  response.error.should.be.a("object");
  should.exist(response.error.code, response.error.message);
  response.error.message.should.be.a("string");
  response.error.code.should.be.a("number");
}

function shouldBeValidResponse(response) {
  should.exist(response, response.jsonrpc, response.id);
  response.jsonrpc.should.equal("2.0");
}

function shouldBeError(server, request, code) {
  return function(done) {
     server.call(request, function(error, result) {
      should.not.exist(result);
      shouldBeValidError(error);
      error.error.code.should.equal(code);
      done();
    });
  };
}
