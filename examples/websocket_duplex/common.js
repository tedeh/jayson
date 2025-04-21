const jayson = require('../../');
const uuid = require('uuid');

exports.getJaysonServer = function () {

  const server = new jayson.Server({
    add: function (args, done) {
      const sum = args.reduce((sum, val) => sum + val, 0);
      done(null, sum);
    },
  });

  return server;
};

exports.randomlyCallClient = function (client) {
  return setInterval(function () {

    setTimeout(function () {
      const id = uuid.v4();
      const args = [random(1, 1000), random(1, 1000)]
      const request = jayson.utils.request('add', args, id);
      console.log(`${id} add(${args.join(', ')})`)
      client.request(request, function (err, result) {
        console.log(`${id} add(${args.join(', ')}) = ${result.result}`);
      });
    }, random(0, 3000));

  }, 1000);
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
