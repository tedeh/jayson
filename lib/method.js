var jayson = require('./');
var utils = require('./utils');
var _ = require('lodash');

/**
 * @summary Constructor for a Jayson Method
 * @class Method
 * @param {Function} [handler] - Function to set as handler
 * @param {Object} [options] 
 * @param {Function} [options.handler] - Same as separate handler
 * @param {Boolean} [options.collect=true] - Params to the handler are collected in one object
 * @param {Array|Object} [options.params] - Defines params that the handler accepts
 */
var Method = function(handler, options) {

  if(!(this instanceof Method)) {
    return new Method(handler, options);
  }

  // only got passed options
  if(_.isPlainObject(handler)) {
    options = handler;
    handler = null;
  }

  var defaults = {
    collect: true
  };

  options = options || {};

  this.options = utils.merge(defaults, options);
  this.handler = handler || options.handler;
};

module.exports = Method;

/**
 * @summary Returns the handler function associated with this method
 * @return {Function}
 */
Method.prototype.getHandler = function() {
  return this.handler;
};

/**
 * @summary Sets the handler function associated with this method
 * @param {Function} handler
 */
Method.prototype.setHandler = function(handler) {
  this.handler = handler;
};

/**
 * @summary Prepare parameters for the method handler
 * @private
 */
Method.prototype._getHandlerParams = function(params) {
  var options = this.options;
  var handler = this.getHandler();

  var isObjectParams = !_.isArray(params) && _.isObject(params) && params;
  var isArrayParams = _.isArray(params);

  if(options.collect) {
    // collect parameters in one argument to handler

    switch(true) {

      // handler always gets an array
      case options.params === Array:
        return isArrayParams ? params : _.toArray(params);

      // handler always gets an object
      case options.params === Object:
        return isObjectParams ? params : _.toPlainObject(params);

      // handler gets a list of defined properties that should always be set
      case _.isArray(options.params):
        var undefinedParams = _.reduce(options.params, function(undefinedParams, key) {
          undefinedParams[key] = undefined;
          return undefinedParams;
        }, {});
        return _.extend(undefinedParams, _.pick(params, _.keys(params)));

      // handler gets a map of defined properties and their default values
      case _.isPlainObject(options.params):
        return _.extend({}, options.params, _.pick(params, _.keys(params)));

      // give params as is
      default:
        return params;
    
    }

  } else {
    // let the arguments pass to the handler as given

    if(isObjectParams) {
      // named parameters passed, take all parameters for handler except last (the callback)
      return _.initial(utils.getParameterNames(handler)).map(function(name) {
        return params[name];
      });
    }

    // regular parameters array passed
    return params;
  }
};

/**
 * @summary Executes this method in the context of a server
 * @param {Server} server
 * @param {Array|Object} requestParams
 * @param {Function} callback
 */
Method.prototype.execute = function(server, requestParams, callback) {
  var options = this.options;
  var handler = this.getHandler();
  var params = this._getHandlerParams(requestParams);

  if(options.collect) {
    return handler.call(server, params, callback);
  }

  // Params is optional according to the JSON-RPC 2.0 spec so if it doesnt
  // exist just create an empty array.
  if (!params) {
    params = [];
  }

  // compare without the callback
  if(handler.length !== (params.length + 1)) {
    callback(server.error(jayson.Server.errors.INVALID_PARAMS));
    return;
  }

  return handler.apply(server, _.flatten([params, callback]));
};
