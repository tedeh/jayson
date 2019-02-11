'use strict';

const jayson = require('./../..');
const cors = require('cors');
const connect = require('connect');
const jsonParser = require('body-parser').json;
const app = connect();

const server = jayson.server({
  myNameIs: function(args, callback) {
    callback(null, 'Your name is: ' + args.name);
  }
});

app.use(cors({methods: ['POST']}));
app.use(jsonParser());
app.use(server.middleware());

app.listen(3000);
