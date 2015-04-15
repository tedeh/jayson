var jayson = require(__dirname);
var utils = require('./utils');
var _ = require('lodash');

/**
 * @summary Constructor for a Jayson Method
 * @class Method
 * @param {Function} [handler] - Function to set as handler
 * @param {Object} [options] 
 * @param {Function} [options.handler] - Same as separate handler
 * @param {Boolean} [options.collect=false] - Params to the handler are collected in one object
 * @param {Array|Object} [options.params] - Defines params that the handler accepts
 */
var Method = module.exports = function(handler, options) {

  if(!(this instanceof Method)) {
    return new Method(handler, options);
  }

  // only got passed options
  if(_.isPlainObject(handler)) {
    options = handler;
    handler = null;
  }

  var defaults = {
    collect: false
  };

  options = options || {};

  this.options = utils.merge(defaults, options);
  this.handler = handler || options.handler;

};

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
 * @summary Executes this method in the context of a server
 * @param {ServerHttp} server
 * @param {Array|Object} params
 * @param {Function} callback
 */
Method.prototype.execute = function(server, params, callback) {

  var handler = this.getHandler();
  var options = this.options;

  var callParams = null;
  var objectParams = !_.isArray(params) && _.isObject(params) && params;
  var arrayParams = _.isArray(params);

  if(options.collect) {

    // collect parameters in one argument to handler

    switch(true) {

      // handler should always be given an array
      case options.params === Array:
        callParams = objectParams ? _.toArray(params) : params;
        break;

      // handler should always be given an object
      case options.params === Object:
        callParams = arrayParams ? _.pick(params, _.keys(params)) : params;
        break;

      // handler has a list of defined properties that should always be set
      case _.isArray(options.params):
        var undefinedParams = _.object(_.zip(options.params, _.range(options.params.length).map(_.constant(undefined))));
        callParams = _.extend(undefinedParams, _.pick(params, _.keys(params)));
        break;

      // handler has a map of defined properties and their default values
      case _.isObject(options.params):
        callParams = _.extend({}, options.params, _.pick(params, _.keys(params)));
        break;

      // give params as is
      default:
        callParams = params;
    
    }

    return handler.call(server, callParams, callback);

  } else {

    // let parameters be sent as given to the handler

    var args = [];

    if(objectParams) {

      // named parameters passed, take all parameters for handler except last (the callback)
      var parameters = _.initial(utils.getParameterNames(handler));

      args = args.concat(parameters.map(function(name) {
        return params[name];
      }));
    }

    // regular parameters array passed
    if(arrayParams) {
      args = args.concat(params);
    }

    args = args.concat(callback);

    if (args.length != handler.length) {
      return callback(server.error(jayson.Server.errors.INVALID_PARAMS));
    } else {
      return handler.apply(server, args);
    }

  }

};
