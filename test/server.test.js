var assert = require('assert');
var should = require('should');

var Server = require(__dirname + '/../').Server;
var utils = require(__dirname + '/../lib/utils');

describe('The server', function() {
  it('should have an object of errors', function() {
    Server.should.have.property('errors');
  });
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

  it('should allow a single method to be added and removed', function() {
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
  var server = getServer();
  var request = 'I am an invalid JSON string';

  it('should not be parsable without throwing an error', function() {
    (function() {
      JSON.parse(request);
    }).should.throw();
  });

  it('used in a request should callback with parse-error', shouldBeError(server, request, -32700));

});

describe('A request with the "jsonrpc"-property that is faulty', function() {
  var server = getServer();
  describe('by being non-existant', function() {
    var request = getValidRequest();
    delete request.jsonrpc;
    it('should used in a request callback with a request-error', shouldBeError(server, request, -32600));
  });

  describe('by being of the wrong value', function() {
    var request = getValidRequest();
    request.jsonrpc = "1.0";
    it('should used in a request callback with a request-error', shouldBeError(server, request, -32600));
  });

});

describe('A request with the "method"-property that is faulty', function() {
  var server = getServer();
  describe('by being of the wrong type', function() {
    var request = getValidRequest();
    request.method = true;
    it('should used in a request callback with a request-error', shouldBeError(server, request, -32600));
  });

  describe('by referring to a nonexistent method', function() {
    var request = getValidRequest();
    request.method = "subtract";
    it('should used in a request callback with a method not found-error', shouldBeError(server, request, -32601));
  });
});

describe('A request with the "id"-property being faulty', function() {
  var server = getServer();
  describe('by being of the wrong type', function() {
    var request = getValidRequest();
    request.id = true;
    it('should used in a request callback with a request-error', shouldBeError(server, request, -32600));
  });
});

describe('A request with the "params"-property being faulty', function() {
  var server = getServer();
  describe('by being of the wrong type', function() {
    var request = getValidRequest();
    request.params = "1";
    it('should used in a request callback with a request-error', shouldBeError(server, request, -32600));
  });
});

describe('An invalid request without an "id"-property', function() {
  var server = getServer();
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
  it('should return an empty response if request could be interpreted', function(done) {
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

describe('A valid request to the "add"-method', function() {
  var server = getServer();
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
  var server = getServer();
  it('should callback empty', function(done) {
    var request = getValidRequest();
    delete request.id;
    server.call(request, function(err, result) {
      should.not.exist(err);
      should.not.exist(result)
      done();
    });
  });
});

describe('An empty batch request', function() {
  var server = getServer();
  var request = [];
  it('should callback with an invalid request-error', shouldBeError(server, request, -32600));
});

describe('A batch request with only invalid requests', function() {
  var server = getServer();
  var request = [1, 2, 3];
  it('should callback with an invalid request-error', function(done) {
    server.call(request, function(err, results) {
      should.not.exist(err);
      shouldBeValidBatchResult(results);
      results.forEach(shouldBeValidError);
      done();
    });
  });
});

describe('A batch request with only notifications', function() {
  var server = getServer();
  var request = [
    getValidRequest(),
    getValidRequest()
  ];

  // Removes the id to make notification
  request.forEach(function(r) { delete r.id; });

  it('should callback with a completely empty response', function(done) {
    server.call(request, function(err, results) {
      should.not.exist(err);
      should.not.exist(results);
      done();
    });
  });
});

describe('A mixed-request batch', function() {
  var server = getServer();
  var requests = [];
  var amount = 3;
  while(amount--) requests.push(getValidRequest());

  // Notification
  delete requests[0].id;
  
  // Invalid request
  requests[1] = 'invalid request';

  it('should callback with a length of 2', function(done) {
    server.call(requests, function(err, results) {
      should.not.exist(err);
      shouldBeValidBatchResult(results);
      results.should.be.instanceof(Array);
      results.should.have.lengthOf(2);
      done();
    });
  });

  it('should callback one error and one succesful response', function(done) {
    server.call(requests, function(err, results) {
      var success = false, error = false;
      for(var i = 0, il = results.length; i < il; i++) {
        var result = results[i];
        if(result.error) error = result;
        if(result.result) success = result;
      }
      shouldBeValidResult(success);
      shouldBeValidError(error);
      done();
    });
  });
});

// prepares a mock server with an "add"-method
function getServer() {
  return new Server({
    add: function(a, b, callback) {
      process.nextTick(function() {
        callback(null, a + b);
      });
    }
  });
}

// prepares a mock request to an "add"-method
function getValidRequest () {
  var params = [
    Math.round(Math.random() * 100),
    Math.round(Math.random() * 100)
  ]
  return utils.request('add', params);
}

function shouldBeValidBatchResult(results) {
  should.exist(results);
  results.should.be.instanceof(Array);
  results.length.should.be.above(0);
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
