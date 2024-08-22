'use strict';

const jayson = require('jayson');

const methods = {
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
};

const server = new jayson.Server(methods, {
  router: function(method, params) {
    // regular by-name routing first
    const fn = this._methods.hasOwnProperty(method) ? this._methods[method] : null;
    if(typeof fn === 'function') {
      return fn;
    }
    if(method === 'add_2') {
      const fn = server.getMethod('add').getHandler();
      return new jayson.Method(function(args, done) {
        args.unshift(2);
        fn(args, done);
      });
    }
  }
});

server.http().listen(3000);
