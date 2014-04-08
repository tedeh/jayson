var jayson = require(__dirname + '/../..');
var format = require('util').format;

var methods = {
  // a method that prints every request
  add: function(a, b, callback) {
    callback(null, a + b);
  }
};

var server = jayson.server(methods, {
  router: function(method) {
    // regular by-name routing first
    if(typeof(this._methods[method]) === 'function') return this._methods[method];
    if(method === 'add_2') return this._methods.add.bind(this, 2);
  }
});

