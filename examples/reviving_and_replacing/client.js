'use strict';

const jayson = require('./../..');
const shared = require('./shared');

const client = jayson.client.http({
  port: 3000,
  reviver: shared.reviver,
  replacer: shared.replacer
});

// create the object
const params = {
  counter: new shared.Counter(2)
};

// invoke "increment"
client.request('increment', params, function(err, response) {
  if(err) throw err;
  const result = response.result;
  console.log(
    result instanceof shared.Counter, // true
    result.count, // 3
    params.counter === result // false - result is a new object
  );
});
