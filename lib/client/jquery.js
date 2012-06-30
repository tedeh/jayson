;(function($, undefined) {

  var ClientJquery = function(options) {
    if(!(this instanceof ClientJquery)) return new ClientJquery(options);

    var defaults = {
      dataType: 'json',
      type: 'POST',
      processData: false,
      headers: { 'content-type': 'application/json' }
    };

    this.options = $.extend(defaults, options || {});
  };

  window.Jayson = ClientJquery;

  ClientJquery.prototype.request = function(method, params, id, callback) {
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

  // Expose the client as a jQuery extension
  $.fn.jayson = function(options) {
    options = options || {};
    var client = new ClientJquery(options);
    client.request(options.method, options.params, options.id, function(err, data) {
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

  // Generates a JSON-RPC 2.0 request (see jayson.utils.request)
  function generateRequest(method, params, id) {
    if($.type(method) !== 'string') {
      throw new TypeError(method + ' must be a string');
    }

    if(!params || !$.isPlainObject(params) && !$.isArray(params)) {
      throw new TypeError(params + ' must be an object or an array');
    }

    var request = {
      jsonrpc: "2.0",
      params: params,
      method: method
    }

    // if id was left out, generate one (null means explicit notification)
    if($.type(id) === 'undefined') {
      request.id = generateId();
    } else {
      request.id = id;
    }
    
    return request;
  }

  // Generates a request ID (see jayson.utils.generateId)
  function generateId() {
    return Math.round(Math.random() * Math.pow(2, 24));
  }

  // Expose the client via AMD if available
  if(typeof(define) === 'function') {
    define('jayson', [], function() {
      return ClientJquery;
    });
  }
})(jQuery);
