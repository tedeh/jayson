var jayson = require(__dirname + '/../..');
var shared = require('./shared');

// create a client with the shared reviver and replacer
var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost',
  reviver: shared.reviver,
  replacer: shared.replacer
});

// create the object
var instance = new shared.Counter(2);

// invoke "increment"
client.request('increment', [instance], function(err, error, result) {
  if(err) throw err;
  console.log(result instanceof shared.Counter); // true
  console.log(result.count); // 3!
  console.log(instance === result); // false - it won't be the same object, naturally
});
