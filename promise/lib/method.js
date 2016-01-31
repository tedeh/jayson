var _ = require('lodash');
var promisify = require('es6-promisify');
var jayson = require('../../');

/**
 * Constructor for a Jayson Promise Method
 * @see Method
 * @class PromiseMethod
 * @extends Method
 * @return {PromiseMethod}
 * @api public
 */
var PromiseMethod = module.exports = function(handler, options) {
  if(!(this instanceof PromiseMethod)) {
    return new PromiseMethod(handler, options);
  }
  jayson.Method.apply(this, arguments);
  this.execute = promisify(this.request);
};
require('util').inherits(PromiseMethod, jayson.Method);

module.exports = PromiseMethod;
