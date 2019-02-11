'use strict';

const should = require('should');
const jayson = require('./../');
const support = require('./support');
const suites = require('./support/suites');
const fetch = require('node-fetch');
const http = require('http');
const url = require('url');

describe('jayson.client.browser', function() {

  const server = jayson.server(support.server.methods(), support.server.options());
  const serverHttp = server.http();

  const callServer = function(request, callback) {
    const options = {
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

  const client = jayson.client.browser(callServer, {
    reviver: support.server.options().reviver,
    replacer: support.server.options().replacer,
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
