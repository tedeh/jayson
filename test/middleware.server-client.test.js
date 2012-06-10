var should = require('should');
var support = require('./support/client-server');
var jayson = require(__dirname + '/..');
var connect = require('connect');

describe('jayson middleware', function() {

  var server;
  var stack = connect.createServer();
  stack.use(connect.json({reviver: support.options.reviver}));
  stack.use(jayson.server(support.methods, support.options).middleware());

  var client = jayson.client.http({
    reviver: support.options.reviver,
    replacer: support.options.replacer,
    host: 'localhost',
    port: 3000
  });

  before(function(done) { server = stack.listen(3000, done); });

  it('should be able to receive a success-method from a client', support.clientRequest(client));

  it('should be able to receive an error-method from a client', support.clientError(client));

  it('should support reviving and replacing', support.clientReviveReplace(client));

  it('should be able to handle a notification', support.clientNotification(client));

  it('should be able to handle a batch request', support.clientBatch(client));

  after(function(done) {
    server.once('close', done);
    server.close();
  })

});
