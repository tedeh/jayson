var should = require('should');
var jayson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var utils = jayson.utils;

describe('Jayson.Server', function() {

  var Server = jayson.Server;
  var ServerErrors = Server.errors;

  it('should have an object of errors', function() {
    Server.should.have.property('errors');
  });

  it('should return an instance without using "new"', function() {
    Server().should.be.instanceof(jayson.Server);
  });

  describe('instance', function() {

    var server = null;

    beforeEach(function() {
      server = Server(support.server.methods, support.server.options);
    });

    it('should have some default options', function() {
      new Server().options.should.containDeep({
        collect: true
      });
    });

    it('should allow a method to be added and removed', function() {
      server.method('subtract', function(a, b, callback) {
        callback(null, a - b);
      });
      server.hasMethod('subtract').should.be.true;
      server.removeMethod('subtract');
      server.hasMethod('subtract').should.be.false;
    });
    
    it('should pass options methodConstructor and make new methods an instanceof it', function() {
      var ctor = function() {};
      server.options.methodConstructor = ctor;
      server.method('add', function(args, done) { done(); });
      server.getMethod('add').should.be.instanceof(ctor);
    });

    it('should pass options collect and params as defaults to jayson.Method', function() {
      server.options.collect = true;
      server.options.params = Object;
      server.method('add', function(args, done) {
        done();
      });
      server.getMethod('add').should.containDeep({
        options: {collect: true, params: Object}
      });
    });

    it('should not allow a method with a reserved name to be added', function() {
      (function() {
        server.method('rpc.test', function(a, b, callback) {
          callback(null, a - b);
        });
      }).should.throw();
      server.hasMethod('rpc.test').should.be.false;
    });

    it('should not allow a method with an invalid name to be added', function() {
      (function() {
        server.method('', function(a, b, callback) {
          callback(null, a - b);
        });
      }).should.throw();
      server.hasMethod('').should.be.false;
    });

    // change server instance error message, request erroring method, assert error message changed
    it('should allow standard error messages to be changed', function(done) {
      var newMsg = server.errorMessages[Server.errors.PARSE_ERROR] = 'Parse Error!';
      server.call('invalid request', function(err) {
        err.should.containDeep({error: { code: Server.errors.PARSE_ERROR, message: newMsg }});
        done();
      });
    });

    describe('error', function() {

      it('should not make an error out of an invalid code', function() {
        var error = server.error('invalid_code');
        error.should.have.property('code', Server.errors.INTERNAL_ERROR);
      });

      it('should fill in the error message if not passed one', function() {
        var code = Server.errors.INVALID_PARAMS;
        var error = server.error(code);
        server.error(code).should.containDeep({
          code: code,
          message: Server.errorMessages[code]
        });
      });

      it('should add a data member if specified', function() {
        var data = {member: 1};
        var code = Server.errors.INVALID_PARAMS;
        var error = server.error(code, null, data);
        error.should.have.property('data', data);
      });

      describe('with a version 1.0 server', function() {

        beforeEach(function() {
          server.options.version = 1;
        });

        it('should consider a string a valid error', function() {
          server.method('errorMethod', function(callback) {
            callback('an error');
          });
          var request = utils.request('errorMethod', []);
          server.call(request, function(err, response) {
            err.error.should.eql('an error');
          });
        });
      });
    });

    describe('router', function() {

      beforeEach(function() {
        server.options.router = function(method, params) {
          if(typeof(this._methods[method]) === 'function') {
            return this._methods[method];
          }
          if(method === 'add_2') {
            var fn = server.getMethod('add').getHandler();
            return new jayson.Method(fn.bind(null, 2), {collect: false});
          }
        };
      });

      it('should call a method by router completion', function(done) {
        var request = utils.request('add_2', [2]);
        server.call(request, function(err, response) {
          if(err) return done(err);
          response.should.have.property('result', 4);
          done();
        });
      });

      it('should "method not found" for a non-existing method', function(done) {
        var request = utils.request('add_4', [2]);
        server.call(request, function(err, response) {
          err.should.containDeep({error: {code: ServerErrors.METHOD_NOT_FOUND}});
          done();
        });
      });
    
    });

    describe('jayson.Client router', function() {
      var client = null;

      beforeEach(function() {
        client = jayson.client(server, support.server.options);
        server.options.router = function(method) {
          return client;
        };
      });

      it('should forward id', function(done) {
        var request = utils.request('method', [], 'test_event_id');

        client._request = function(request, cb) {
          request.id.should.eql('test_event_id');
          cb(null);
        };

        server.call(request, function() {
          done();
        });
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

      // add event handler, exec request, assert event handler ran
      function reqShouldEmit(request, name, handler) {
        return function(done) {
          var fired = false;

          server.once(name, function() {
            handler.apply(null, arguments);
            fired = true;
          });

          server.call(request, function(err) {
            if(err) return done(err);
            fired.should.equal(true);
            done();
          });

        };
      }

    });

    describe('invalid request with wrong format', function() {

      it('should callback a "Parse Error"', function(done) {
        var request = 'I am a completely invalid request';
        server.call(request, function(err) {
          err.should.containDeep({error: {code: ServerErrors.PARSE_ERROR}});
          done();
        });
      });

    });

    describe('invalid request with an erroneous "jsonrpc"-property', function() {

      it('should callback a "Request Error" by having a wrong value', function(done) {
        var request = utils.request('add', []);
        request.jsonrpc = '1.0';
        server.call(request, function(err) {
          err.should.containDeep({error: {code: ServerErrors.INVALID_REQUEST}});
          done();
        });
      });

      it('should callback a "Request Error" by being non-existent', function(done) {
        var request = utils.request('add', []);
        delete request.jsonrpc;
        server.call(request, function(err) {
          err.should.containDeep({error: {code: ServerErrors.INVALID_REQUEST}});
          done();
        });
      });

    });

    describe('invalid request with an erroneous "method"-property', function() {

      it('should callback with a "Request Error" if it is of the wrong type', function(done) {
        var request = utils.request('add', []);
        request.method = true;
        server.call(request, function(err) {
          err.should.containDeep({error: {code: ServerErrors.INVALID_REQUEST}});
          done();
        });
      });

      it('should callback with a "Method Not Found" if it refers to a non-existing method', function(done) {
        var request = utils.request('add', []);
        request.method = 'subtract';
        server.call(request, function(err) {
          err.should.containDeep({error: {code: ServerErrors.METHOD_NOT_FOUND}});
          done();
        });
      }); 

    });

    describe('invalid request with an erroneous "id"-property', function() {

      it('should callback with a "Request Error" if it is of the wrong type', function(done) {
        var request = utils.request('add', []);
        request.id = true;
        server.call(request, function(err) {
          err.should.containDeep({error: {code: ServerErrors.INVALID_REQUEST}});
          done();
        });
      });

      it('should callback with the "id"-property set to null if it is non-interpretable', function(done) {
        var request = utils.request('add', []);
        delete request.id;
        request = JSON.stringify(request).slice(0, request.length - 5);
        server.call(request, function(err) {
          should(err.id).equal(null);
          done();
        });
      });

      it('should callback empty if the request is interpretable', function(done) {
        var request = utils.request('add', [1, 2]);
        delete request.id;
        server.call(request, function(err, response) {
          if(err) return done(err);
          should(response).not.exist;
          done();
        });
      });

    });

    describe('invalid request with wrong "params"', function() {

      it('should callback with a "Request Error" if it is of the wrong type', function(done) {
        var request = utils.request('add', []);
        request.params = '1';
        server.call(request, function(err) {
          err.should.containDeep({error: {code: ServerErrors.INVALID_REQUEST}});
          done();
        });
      });

    });

    describe('request', function() {

      it('should return the expected result', function(done) {
        var request = utils.request('add', [3, 9]);
        server.call(request, function(err, response) {
          if(err) return done(err);
          response.should.have.property('result', 3 + 9);
          done();
        });
      });

      it('should "Internal Error" when the method returns an invalid error', function(done) {
        var request = utils.request('invalidError', ['hello']);
        server.call(request, function(err, response) {
          should(response).not.exist;
          err.should.containDeep({error: {code: ServerErrors.INTERNAL_ERROR}});
          done();
        });
      });

    });

    describe('request to a method that does not callback anything', function() {

      it('should return a result regardless', function(done) {
        var request = utils.request('empty', [true]);
        server.call(request, function(err, response) {
          if(err) return done(err);
          response.should.have.property('result');
          done();
        });
      });

    });

    describe('named parameters', function() {

      it('should return as expected', function(done) {
        var request = utils.request('add', {b: 2, a: 9});
        server.call(request, function(err, response) {
          if(err) return done(err);
          response.should.containDeep({result: 2 + 9});
          done();
        });
      });

      it('should not fail when not given sufficient arguments', function(done) {
        var request = utils.request('add', {});
        server.call(request, function(err, response) {
          if(err) return done(err);
          isNaN(response.result).should.equal(true);
          done();
        });
      });

    });

    describe('notification requests', function() {

      it('should handle a valid notification request', function(done) {
        var request = utils.request('add', [3, -3], null);
        server.call(request, function(err, response) {
          if(err) return done(err);
          should.not.exist(response);
          done();
        });
      });

      it('should handle an erroneous notification request', function(done) {
        var request = utils.request('subtract', [3, -3], null);
        server.call(request, function(err, response) {
          if(err) return done(err);
          should.not.exist(response);
          done();
        });
      });

    });

    describe('reviving and replacing', function() {

      it('should be able to return the expected result', function(done) {
        var counter = new support.Counter(5);
        var request = utils.request('incrementCounterBy', [counter, 5]);
        server.call(request, function(err, response) {
          if(err) return done(err);
          var result = response.result;
          result.should.be.an.instanceof(support.Counter);
          result.count.should.equal(5 + 5);
          done();
        });
      });

    });

    describe('batch requests', function() {

      describe('with a version 1.0 server', function() {

        beforeEach(function() {
          server.options.version = 1;
        });

        it('should error when version is 1.0', function(done) {

          var request = [
            utils.request('add', [1, 1]),
            utils.request('add', [2, 2])
          ];

          server.call(request, function(err, response) {
            should.not.exist(response);
            err.should.containDeep({error: {code: ServerErrors.INVALID_REQUEST}});
            done();
          });

        });
      
      });

      it('should handle an empty batch', function(done) {
        server.call([], function(err, response) {
          err.should.containDeep({error: {code: ServerErrors.INVALID_REQUEST}});
          should.not.exist(response);
          done();
        });
      });

      it('should handle a batch with only invalid requests', function(done) {
        var requests = [1, 'a', true];
        server.call(requests, function(err, response) {
          if(err) return done(err);

          response.should.be.instanceof(Array).and.have.length(3);
          response.forEach(function(response) {
            response.error.code.should.equal(ServerErrors.INVALID_REQUEST);
          });
          done();
        });
      });

      it('should handle a batch with only notifications', function(done) {

        var request = [
          utils.request('add', [3, 4], null),
          utils.request('add', [4, 5], null)
        ];

        server.call(request, function(err, responses) {
          if(err) return done(err);
          should(responses).not.exist;
          done();
        });

      });

      it('should handle mixed requests', function(done) {

        var request = [
          utils.request('add', [1, 1], null),
          'invalid request',
          utils.request('add', [2, 2])
        ];

        server.call(request, function(err, responses) {
          if(err) return done(err);

          responses.should.be.instanceof(Array).and.have.length(2);
          responses[0].should.containDeep({error: {code: ServerErrors.INVALID_REQUEST}});
          responses[1].should.have.property('result', 2 + 2);
          done();

        });

      });

      it('should be able return method invocations in correct order', function(done) {

        var request = [ 
          utils.request('add_slow', [1, 1, true]),
          utils.request('add_slow', [1, 2, false])
        ];

        server.call(request, function(err, responses) {
          if(err) return done(err);
          responses.should.be.instanceof(Array).and.have.length(2);
          responses[0].should.have.property('result', 1 + 1);
          responses[1].should.have.property('result', 1 + 2);
          done();
        });
      
      });

    });

  });

});
