'use strict';

const _ = require('lodash');
const jayson = require('./../..');
const jsonParser = require('body-parser').json;
const express = require('express');
const app = express();

const server = jayson.server({

  getHeaders: function(args, context, callback) {
    callback(null, context.headers);
  },

  // old method not receiving a context object (here for reference)
  oldMethod: new jayson.Method(function(args, callback) {
    callback(null, {});
  }, {
    // this setting overrides the server option set below for this particular method
    useContext: false
  })

}, {
  // all methods will receive a context object as the second arg
  useContext: true
});

app.use(jsonParser());
app.use(function(req, res, next) {
  // prepare a context object passed into the JSON-RPC method
  const context = {headers: req.headers};
  server.call(req.body, context, function(err, result) {
    if(err) return next(err);
    res.send(result || {});
  });
});

app.listen(3001);
