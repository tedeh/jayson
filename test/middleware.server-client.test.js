var should = require('should');
var support = require('./support/client-server');
var jayson = require(__dirname + '/..');
var connect = require('connect');

describe('jayson middleware', function() {

  var server, client, context = {};

  beforeEach(function(done) {
    server = context.server = connect.createServer();
    server.use(connect.json({reviver: support.options.reviver}));
    server.use(jayson.server(support.methods, support.options).middleware());
    server = server.listen(3000, done);
  });

  beforeEach(function() {
    client = context.client = jayson.client.http({
      reviver: support.options.reviver,
      replacer: support.options.replacer,
      host: 'localhost',
      port: 3000
    });
  });

  afterEach(function() {
    if(server) server.close();
  });

  it('should be able to receive a success-method from a client', support.clientRequest(context));

  it('should be able to receive an error-method from a client', support.clientError(context));

  it('should support reviving and replacing', support.clientReviveReplace(context));

  it('should be able to handle a notification', support.clientNotification(context));

  it('should be able to handle a batch request', support.clientBatch(context));

});
