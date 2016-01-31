var should = require('should');
var jayson = require(__dirname + '/../promise');
var support = require(__dirname + '/support');

describe('JaysonPromise', function() {

  describe('PromiseServer', function() {

    var PromiseServer = jayson.Server;

    it('should return an instance without using "new"', function() {
      PromiseServer().should.be.instanceof(PromiseServer);
    });

    describe('instance', function() {

      var server = null;
      beforeEach(function() {
        server = new jayson.Server(support.server.methods, support.server.options);
      });

      describe('call', function() {

        it('should return a fulfilled promise', function() {
          var request = jayson.utils.request('add', [1, 2]);
          return server.call(request).should.be.fulfilled().then(function(response) {
            response.should.containDeep({result: 3});
          });
        });

        it('should return a rejected promise', function() {
          var request = jayson.utils.request('error', []);
          return server.call(request).should.be.rejected().then(function(response) {
            response.should.containDeep({error: {code: -1000}});
          });
        });

      });
      
    });
  
  });

  describe('PromiseClient', function() {

    var PromiseClient = jayson.Client;

    it('should return an instance without using "new"', function() {
      PromiseClient(jayson.Server()).should.be.instanceof(PromiseClient);
    });

    describe('instance', function() {

      var server, client = null;
      beforeEach(function() {
        server = new jayson.Server(support.server.methods, support.server.options);
        client = new jayson.Client(server, support.server.options);
      });

      describe('request', function() {

        it('should do a request and fulfill a promise', function() {
          return client.request('add', [333, 333]).should.be.fulfilled().then(function(response) {
            response.should.containDeep({result: 666});
          });
        });

        it('should do a request and fulfill a promise that errored', function() {
          return client.request('error', []).should.be.fulfilled().then(function(response) {
            response.should.containDeep({error: {code: -1000}});
          });
        });
      
      });
    
    });
  
  });

  describe('PromiseMethod', function() {

    var PromiseMethod = jayson.Method;

    it('should return an instance without using "new"', function() {
      PromiseMethod(function() {}).should.be.instanceof(PromiseMethod);
    });

    describe('instance', function() {

      var method = null, server = new jayson.Server();
      beforeEach(function() {
        method = new PromiseMethod({collect: true});
      });

      describe('execute', function() {

        var handlers = {
          sum: function(args) {
            return new Promise(function(resolve, reject) {
              var sum = _.reduce(args, function(sum, arg) { return sum + arg; }, 0);
              resolve(sum);
            });
          },
          error: function(args) {
            return new Promise(function(resolve, reject) {
              var code = args.code || -1;
              reject({code: code});
            })
          }
        };

        it('should allow a promise to be returned by the handler', function() {
          method.setHandler(handlers.sum);
          return method.execute(server, [1, 2, 3]).should.be.fulfilled().then(function(response) {
            response.should.containDeep({result: 6});
          });
        });

      });
    
    });
  
  });

});
