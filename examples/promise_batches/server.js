var jayson = require('../../promise');
var _ = require('lodash');

var server = jayson.server({

  add: function(args) {
    return new Promise(function(resolve, reject) {
      var sum = _.reduce(args, function(sum, value) { return sum + value; }, 0);
      resolve(sum);
    });
  }

});

server.http().listen(3000);
