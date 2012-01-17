var net = require('net');
var utils = require(__dirname + '/../utils');

var JaysonTcpServer = module.exports = function(server) {
  if(!(this instanceof JaysonTcpServer)) return new JaysonTcpServer(server);

  var self = this;

  net.Server.call(this);

  this.on('connection', function(client) {
    var data = ''
    client.setEncoding('utf8');
    client.on('data', function(chunk) { data += chunk; });
    client.on('end', function() {
      try {
        var request = JSON.parse(data);
      } catch(err) {
        return self.emit('error', err);
      }
      
      server.call(request, function(error, success) {
        var response = error || success;

        if(!response) return;

        try {
          var body = JSON.stringify(response);
        } catch(err) {
          // invalid response from server?!
          return;
        }

        // writes back to client
        client.write(body, function() {
          // ends connection
          client.end();
        });
      });

    });
  });

  self.on('error', function(err) {
  
  });

  self.on('close', function() {
  
  });
};
utils.inherits(JaysonTcpServer, net.Server);

