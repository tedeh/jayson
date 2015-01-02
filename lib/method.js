var jayson = require(__dirname);
var utils = require('./utils');
var _ = require('underscore');

var Method = module.exports = function(options) {
  if(!(this instanceof Method)) {
    return new Method(options);
  }

  var defaults = {
    collect: true
  };

  if(_.isFunction(options) || options instanceof jayson.Client) {
    options = {
      handler: options,
      collect: false
    };
  }

  this.options = utils.merge(defaults, options || {});

};

Method.prototype.getHandler = function() {
  return this.options.handler;
};

Method.prototype.execute = function(server, params, callback) {

  var handler = this.getHandler();

  var objectParams = !_.isArray(params) && _.isObject(params) && params;
  var arrayParams = _.isArray(params);

  if(this.options.collect) {

    // collect parameters inside a single object

    var defaults = this.options.defaults || {};
    var names = _.keys(this.options.params || {});
    var undefinedParams = _.object(_.zip(names, _.range(names.length).map(_.constant(undefined))));
    var callParams = null;

    if(objectParams) {

      callParams = utils.merge(undefinedParams, defaults, params);
    
    } else {

      callParams = utils.merge(undefinedParams, defaults, _.object(_.map(params, function(param, index) {
        return [names[index], param];
      })));
    
    }

    return handler.call(server, callParams, callback);

  } else {

    // let parameters be given as-given to in request
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

    return handler.apply(server, args);
  
  }

};
