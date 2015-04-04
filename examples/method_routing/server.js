var jayson = require(__dirname + '/../..');
var format = require('util').format;

var methods = {
  add: function(a, b, callback) {
    callback(null, a + b);
  }
};

var server = jayson.server(methods, {
  router: function(method) {
    // regular by-name routing first
    if(typeof(this._methods[method]) === 'function') return this._methods[method];
    if(method === 'add_2') {
      var fn = server.getMethod('add').getHandler();
      return jayson.Method(fn.bind(null, 2));
    }
  }
});

server.http().listen(3000);
