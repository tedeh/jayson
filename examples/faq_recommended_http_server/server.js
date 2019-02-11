'use strict';

const _ = require('lodash');
const jayson = require('./../..');
const jsonParser = require('body-parser').json;
const express = require('express');
const app = express();

// create a plain jayson server
const server = jayson.server({
  add: function(numbers, callback) {
    callback(null, _.reduce(numbers, (sum, val) => sum + val, 0));
  }
});

app.use(jsonParser()); // <- here we can deal with maximum body sizes, etc
app.use(function(req, res, next) {
  const request = req.body;
  // <- here we can check headers, modify the request, do logging, etc
  server.call(request, function(err, response) {
    if(err) {
      // if err is an Error, err is NOT a json-rpc error
      if(err instanceof Error) return next(err);
      // <- deal with json-rpc errors here, typically caused by the user
      res.status(400);
      res.send(err);
      return;
    }
    // <- here we can mutate the response, set response headers, etc
    if(response) {
      res.send(response);
    } else {
      // empty response (could be a notification)
      res.status(204);
      res.send('');
    }
  });
});

app.listen(3001);
