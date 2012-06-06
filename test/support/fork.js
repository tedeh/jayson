var jayson = require(__dirname + '/../../');
var support = require(__dirname + '/client-server');

module.exports = jayson.server(support.methods, support.options);
