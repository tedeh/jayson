var should = require('should');
var jayson = require(__dirname + '/..');
var support = require('./support');
var common = support.common;

describe('Jayson.Relay', function() {

  describe('server', function() {

    it('should be created with a client as a method', function() {
      var server = jayson.server(support.methods, support.server.options);
      jayson.server({add: jayson.client(server)}, support.server.options);
    });

  });

  describe('client', function() {

    var options = support.server.options;

    var front_server = jayson.server({}, options);
    var back_server = jayson.server(support.server.methods, options);
    var relay_client = jayson.client(back_server, options);
    var front_client = jayson.client(front_server, options);

    // replace all methods in front server with the client
    Object.keys(back_server._methods).forEach(function(name) {
      front_server.method(name, relay_client);
    });

    describe('common tests', common(front_client));

  });

});
