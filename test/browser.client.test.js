var should = require('should');
var jayson = require('./../');
var support = require('./support');
var suites = require('./support/suites');
var fetch = require('node-fetch');
var http = require('http');
var url = require('url');

describe('jayson.client.browser', function() {

  var server = jayson.server(support.server.methods, support.server.options);
  var serverHttp = server.http();

  var callServer = function(request, callback) {
    var options = {
      method: 'POST',
      body: request,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    fetch('http://localhost:3999', options)
      .then(function(res) { return res.text(); })
      .then(function(text) { callback(null, text); })
      .catch(function(err) { callback(err); });
  };

  var client = jayson.client.browser(callServer, {
    reviver: support.server.options.reviver,
    replacer: support.server.options.replacer,
  });

  before(function(done) {
    serverHttp.listen(3999, 'localhost', done);
  });

  after(function() {
    if(serverHttp) serverHttp.close();
  });

  describe('client', function() {

    describe('common tests', suites.getCommonForClient(client, {
      instanceOfClient: false
    }));

  });

});
