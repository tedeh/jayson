var jayson = require(__dirname + '/../..');
var shared = require('./shared');

var client = jayson.client.http({
  port: 3000,
  reviver: shared.reviver,
  replacer: shared.replacer
});

// create the object
var params = {
  counter: new shared.Counter(2)
};

// invoke "increment"
client.request('increment', params, function(err, response) {
  if(err) throw err;
  var result = response.result;
  console.log(
    result instanceof shared.Counter, // true
    result.count, // 3
    params.counter === result // false - result is a new object
  );
});
