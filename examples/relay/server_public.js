var jayson = require(__dirname + '/../..');

// create a server where "add" will relay a localhost-only server
var server = jayson.server({
  add: jayson.client.http({
    port: 3001
  })
});

// let the frontend server listen to *:3000
server.http().listen(3000);
