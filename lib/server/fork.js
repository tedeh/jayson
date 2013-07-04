var utils = require('../utils');
var fork = require('child_process').fork;
var path = require('path');
var JaysonServer = require('../server');

/**
 *  Constructor for a Jayson JSON-RPC Fork Server
 *  @class Jayson JSON-RPC Fork Server
 *  @param {String} path The path that contains the fork
 *  @param {Object} options
 *  @returns {ForkServer}
 *  @api public
 */
var ForkServer = function(path, options) {
  if(!(this instanceof ForkServer)) return new ForkServer(path, options);

  // reference to the child process
  this.child = null;

  this.path = path;

  // stack to keep track of requests
  this.stack = [];

  var defaults = {
    reviver: null,
    replacer: null,
    encoding: 'utf8'
  };

  this.options = utils.merge(defaults, options || {});

  // assigns interfaces to this fork
  var interfaces = JaysonServer.interfaces;
  for(var name in interfaces) {
    this[name] = interfaces[name].bind(interfaces[name], this);
  }

  this.spawn();
};
utils.inherits(ForkServer, JaysonServer);

module.exports = ForkServer;

/**
 * Kills the child process
 * @returns {void}
 * @api public
 */
ForkServer.prototype.kill = function() {
  this.child.kill.apply(this.child, arguments); 
};

/**
 * Creates the child process if it does not already exist
 * @returns {void}
 * @api public
 */
ForkServer.prototype.spawn = function() {
  var self = this;
  if(this.child) return;
  this.child = fork(path.resolve(__dirname + '/../fork'), [this.path], this.options);

  this.child.on('close', function(code, signal) {
    self.child = null;
  });

  this.child.on('message', function(msg) {
    if(!isValidMessage(msg)) return;
    var callback = self.stack[msg.index];
    if(!callback) return;
    if(msg.err) {
      callback(null, msg.err);
    } else if(typeof(msg.response) === 'string') {
      utils.JSON.parse(msg.response, self.options, callback);
    } else {
      callback();
    }
    self.stack[msg.index] = null;
  });
};

/**
 * Sends a request to the child process
 * @param {Object} request JSON-RPC request
 * @param {Function} callback Recieves the result of the request
 * @returns {void}
 * @api public
 */
ForkServer.prototype.call = function(request, callback) {
  var self = this;
  if(!this.child) this.spawn();

  utils.JSON.stringify(request, this.options, function(err, body) {
    if(err) return callback(err);

    self.child.send({
      index: self.stack.push(callback) - 1,
      request: body
    });
  });
};

/**
 * Is this a valid message from the child process?
 * @ignore
 */
function isValidMessage(msg) {
  return Boolean(
    msg
    && typeof(msg) === 'object'
    && typeof(msg.index) === 'number'
  );
}
