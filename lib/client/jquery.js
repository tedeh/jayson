;(function($, undefined) {

  /**
   *  Constructor for a Jayson Jquery Client
   *  @class Jayson JSON-RPC Jquery Client
   *  @name JqueryClient
   *  @param {Object} options Settings for the ajax request
   *  @return {JqueryClient} 
   *  @api public
   */
  var JqueryClient = function(options) {
    if(!(this instanceof JqueryClient)) return new JqueryClient(options);

    var defaults = {
      dataType: 'json',
      type: 'POST',
      processData: false,
      generator: generateId,
      headers: { 'Content-Type': 'application/json' }
    };

    this.options = $.extend(defaults, options || {});
  };
   
  window.Jayson = JqueryClient;

  /**
   *  Sends a request to the server
   *  @see Utils.request
   *  @return {void}
   *  @api public
   */
  JqueryClient.prototype.request = function(method, params, id, callback) {
    // wrap around the error and success callbacks for post-processing
    var options = $.extend({}, this.options, {
      error: function(xhr, status, error) { callback($.makeArray(arguments)); },
      success: function(data, status, xhr) { callback(null, data); }
    });
    try {
      var request = generateRequest(method, params, id);
      options.data = options.processData ? request : JSON.stringify(request);
    } catch(error) {
      return callback(error);
    }
    $.ajax(options);
  };

  /**
   * Expose the client as a jQuery extension
   * @ignore
   */
  $.fn.jayson = function(options) {
    options = options || {};
    var client = new JqueryClient(options);
    client.request(options.method, options.params, options.id, {generator: options.generator}, function(err, data) {
      if(err) {
        if($.isFunction(options.error)) {
          return options.error.apply(options.error, err);
        } else {
          return; // do nothing, no error handlers provided
        }
      }

      if($.isFunction(options.response)) {
        if(options.response.length === 2) {
          data.error ? options.response(data.error) : options.response(null, data.result);
        } else {
          options.response(data);
        }
      } else {
        return; // do nothing, no response handler provided
      }
    });
    return this;
  };

  /**
   * Generates a JSON-RPC 2.0 request
   * @see Utils.request
   */
  function generateRequest(method, params, id, options) {
    if($.type(method) !== 'string') {
      throw new TypeError(method + ' must be a string');
    }

    if(!params || !$.isPlainObject(params) && !$.isArray(params)) {
      throw new TypeError(params + ' must be an object or an array');
    }

    options = options || {};

    var request = {
      jsonrpc: "2.0",
      params: params,
      method: method
    };

    // if id was left out, generate one (null means explicit notification)
    if($.type(id) === 'undefined') {
      var generator = typeof(options.generator) === 'function' ? options.generator : generateId;
      request.id = generator(request);
    } else {
      request.id = id;
    }
    
    return request;
  }

  /**
   * Generates a request ID
   * @see Utils.generateId
   */
  function generateId() {
    return Math.round(Math.random() * Math.pow(2, 24));
  }

  // Expose the client via AMD if available
  if(typeof(define) === 'function') {
    define('jayson', [], function() {
      return JqueryClient;
    });
  }
})(jQuery);
