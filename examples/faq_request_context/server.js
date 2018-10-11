var _ = require('lodash');
var jayson = require('./../..');
var jsonParser = require('body-parser').json;
var connect = require('connect');
var app = connect();

var server = jayson.server({
  getHeaders: function(args, callback) {
    callback(null, args.headers);
  }
}, {
  params: Object, // all method args are always objects (never arrays)
});

app.use(jsonParser());
app.use(function(req, res, next) {
  // decorate the request with header params or whatever other contextual values are desired
  _.set(req.body, 'params.headers', req.headers);
  next();
});
app.use(server.middleware());

app.listen(3001);
