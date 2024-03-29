'use strict';

const jayson = require('jayson');

const methods = {
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
};

const server = new jayson.server(methods, {
  router: function(method, params) {
    // regular by-name routing first
    if(typeof(this._methods[method]) === 'function') return this._methods[method];
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
