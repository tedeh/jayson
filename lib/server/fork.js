var utils = require('../utils');
var fork = require('child_process').fork;
var path = require('path');
var JaysonServer = require('./index');

/**
 *  Constructor for a Jayson JSON-RPC Fork Server
 *  @constructor
 *  @param {String} path The path that contains the fork
 *  @param {Object} options
 *  @return {JaysonForkServer}
 *  @api public
 */
var JaysonForkServer = module.exports = function(path, options) {
  if(!(this instanceof JaysonForkServer)) return new JaysonForkServer(path, options);

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
utils.inherits(JaysonForkServer, JaysonServer);

JaysonForkServer.prototype.kill = function() {
  this.child.kill.apply(this.child, arguments); 
};

JaysonForkServer.prototype.spawn = function() {
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
      var response = {};
      var reviver = self.options.reviver;
      // parses JSON
      try { response = JSON.parse(msg.response, reviver); } catch(err) { return callback(err); }
      callback(null, response);
    } else {
      callback();
    }
    self.stack[msg.index] = null;
  });
};

JaysonForkServer.prototype.call = function(request, callback) {
  var self = this;
  if(!this.child) this.spawn();

  var body = '';
  var replacer = this.options.replacer;
  // stringifies JSON
  try { body = JSON.stringify(request, replacer); } catch(err) { return callback(err); }

  self.child.send({
    index: self.stack.push(callback) - 1,
    request: body
  });
};

function isValidMessage(msg) {
  return Boolean(
    msg
    && typeof(msg) === 'object'
    && typeof(msg.index) === 'number'
  );
}
