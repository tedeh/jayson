'use strict';

const jayson = require('jayson');

// create a server where "add" will relay a localhost-only server
const server = new jayson.server({
  add: new jayson.client.http({
    port: 3001
  })
});

// let the frontend server listen to *:3000
server.http().listen(3000);
