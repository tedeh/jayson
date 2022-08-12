'use strict';

const jayson = require('jayson');

const server = new jayson.server({
  add: validateReturnsNumber(function (args, done) {
    const result = Object.keys(args).reduce((sum, key) => sum + args[key], 0);
    done(null, result);
  }),
});

server.http().listen(3000);

// this validator errors unless the value returned from the wrapped function is a finite number
function validateReturnsNumber (fn) {
  return function (args, done) {
    const self = this;
    return fn(args, function (err, result) {
      if (err) return done(err);
      if (!isFinite(result)) {
        return done(self.error(500, 'not a finite number'));
      }
      return done(null, result);
    });
  };
}
