var should = require('should');
var support = require('./support');
var suites = require(__dirname + '/support/suites');
var jayson = require(__dirname + '/..');
var connect = require('connect');

describe('Jayson.Middleware', function() {

  var app = connect.createServer();
  var server = null; // set in before()
  var client = jayson.client.http({
    reviver: support.server.options.reviver,
    replacer: support.server.options.replacer,
    host: 'localhost',
    port: 3000
  });

  before(function(done) {
    app.use(connect.json({reviver: support.server.options.reviver}));
    app.use(jayson.server(support.server.methods, support.server.options).middleware());
    server = app.listen(3000, done);
  });

  after(function() {
    server.close();
  });

  describe('common tests', suites.getCommonForClient(client));

  describe('options.end false', function() {

    before(function() {
      // change last connect stack handle to one with new options
      app.stack[app.stack.length - 1].handle = jayson.server(support.server.methods, support.server.options).middleware({
        end: false
      });
    });

    it('should support passing to the next middleware', function(done) {
      var invocations = 0;
      app.use(function(req, res, next) {
        invocations++;
        res.end();
      });
      client.request('add', [3, 4], function(err, error, response) {
        if(err) return done(err);
        if(error) return done(error);
        response.should.eql(3 + 4);
        invocations.should.eql(1);
        done();
      });
    });
  
  });

});
