var utils = require('../utils');
var fork = require('child_process').fork;
var EventEmitter = require('events').EventEmitter;

var JaysonForkServer = module.exports = function(server, options) {
  if(!(this instanceof JaysonForkServer)) return new JaysonForkServer(server, options);
  this.child = null;
  this.stack = [];
  options = exports.merge(server.options, options || {});

  // check defer, if not spawn immediately
  this.spawn();
};
utils.inherits(JaysonForkServer, EventEmitter);

JaysonForkServer.prototype.kill = function() {
  this.process.kill.apply(this.process, arguments); 
};

JaysonForkServer.prototype.spawn = function() {
  var self = this;
  if(this.child) return;
  this.child = fork('../fork');
  this.child.on('exit', this.exitHandler.bind(this));
  this.child.on('message', this.messageHandler.bind(this));
  this.child.send({
    options: this.options,
    methods: this._methods
  });
};

JaysonForkServer.prototype.messageHandler = function(msg) {
  if(!msg || typeof(msg) !== 'object') return;
  if(typeof(msg.index) === 'number') {
    var callback = this.stack[msg.index];
    if(!callback) return;
    if(msg.err) return callback(msg.err);
    callback(msg.response);
    this.stack.splice(index, 1);
  }
};

JaysonForkServer.prototype.exitHandler = function(code, signal) {
  this.child = null;
  // check defer, if not spawn again immediately
};

JaysonForkServer.prototype.call = function(request, callback) {
  console.log('calling fork', request)
  if(!this.child) this.spawn();
  var index = stack.push(callback);
  this.child.send({ id: index, request: request });
};

Object.defineProperty(JaysonForkServer.prototype, 'pid', {
  get: function() { return this.child && this.child.pid; }
});
