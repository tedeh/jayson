var jayson = require(__dirname + '/../..');

// create a server where "add" will relay a localhost-only server
var server = jayson.server({
  add: jayson.client.http({
    hostname: 'localhost',
    port: 3001
  })
});

// let the server listen to *:3000
server.http().listen(3000, function() {
  console.log('Listening on *:3000');
});
