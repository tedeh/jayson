import * as jayson from './..';
import * as jaysonPromise from './../promise';

/**
 * This file contains tests for the typescript type definitions.
 * Most of them are based on the examples files.
 */

export function test_example_1() {
  var jsonParser = require('body-parser').json;
  var connect = require('connect');
  var app = connect();

  var server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  // parse request body before the jayson middleware
  app.use(jsonParser());
  app.use(server.middleware());

  app.listen(3000);
}

export function test_example_2() {

  var server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  var client = new jayson.Client(server);

  var batch = [
    client.request('does_not_exist', [10, 5]),
    client.request('add', [1, 1]),
    client.request('add', [0, 0], null) // a notification
  ];

  client.request(batch, function(err:any, errors:any, successes:any) {
    if(err) throw err;
    console.log('errors', errors); // array of requests that errored
    console.log('successes', successes); // array of requests that succeeded
  });

  client.request(batch, function(err:any, responses:any) {
    if(err) throw err;
    console.log('responses', responses); // all responses together
  });
}

export function test_example_3() {

  var client = jayson.Client.https({
    port: 3000
  });

  client.request('multiply', [5, 5], function(err, error, result) {
    if(err) throw err;
    console.log(result); // 25
  });
}

export function test_example_4() {

  var server = new jayson.Server({
    multiply: function(args:any, callback:any) {
      callback(null, args[0] * args[1]);
    }
  });

  server.https().listen(3000, function() {
    console.log('Server listening on http://localhost:3000');
  });
}

export function test_example_5() {
  var fs = require('fs');
  var path = require('path');

  var options = {
    port: 3000,
    host: 'localhost'
  };

  // create a client
  var client = jayson.Client.tcp(options);

  // invoke "add"
  client.request('add', [1, 1], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 2
  });
}

export function test_example_6() {
  var fs = require('fs');
  var path = require('path');

  var options = {
  };

  // create a server
  var server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  // Bind a http interface to the server and let it listen to localhost:3000
  server.tcp(options).listen(3000);
}

export function test_example_7() {

  var client = jayson.Client.http({
    port: 3000
  });

  client.request('multiply', [5, 5], function(err:any, error:any, result:any) {
    if(err) throw err;
    console.log(result); // 25
  });
}

export function test_example_8() {

  var server = new jayson.Server({
    multiply: function(args:any, callback:any) {
      callback(null, args[0] * args[1]);
    }
  });

  server.http().listen(3000, function() {
    console.log('Server listening on http://localhost:3000');
  });
}

export function test_example_9() {

  var client = jaysonPromise.Client.http({
    port: 3000
  });

  var batch = [
    client.request('add', [1, 2, 3, 4, 5], undefined, false),
    client.request('add', [5, 6, 7, 8, 9], undefined, false),
  ];

  client.request(batch).then(function(responses) {
    console.log(responses[0].result); // 15
    console.log(responses[1].result); // 35
  });
}

export function test_example_10() {
  var _ = require('lodash');

  var server = new jayson.Server({

    add: function(args:any) {
      return new Promise(function(resolve, reject) {
        var sum = _.reduce(args, function(sum:number, value:number) { return sum + value; }, 0);
        resolve(sum);
      });
    }

  });

  server.http().listen(3000);
}

export function test_example_11() {

  var server = new jayson.Server();

  // "http" will be an instance of require('http').Server
  var http = server.http();

  // "https" will be an instance of require('https').Server
  var https = server.https({
    //cert: require('fs').readFileSync('cert.pem'),
    //key require('fs').readFileSync('key.pem')
  });

  http.listen(80, function() {
    console.log('Listening on *:80');
  });

  https.listen(443, function() {
    console.log('Listening on *:443');
  });
}

export function test_example_12() {

  var client = jayson.Client.http({
    port: 3000
  });

  client.request('add', {b: 1, a: 2}, function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 3!
  });
}

export function test_example_13() {

  var server = new jayson.Server({
    add: function(a:any, b:any, callback:any) {
      callback(null, a + b);
    }
  }, {
  });

  server.http().listen(3000);
}

export function test_example_14() {

  // create a client
  var client = jayson.Client.http({
    port: 3000
  });

  // invoke "add"
  client.request('add', [1, 1], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 2
  });
}

export function test_example_15() {

  // create a server
  var server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  server.http().listen(3000);
}

export function test_example_16() {

  var client = jayson.Client.http({
    port: 3000
  });

  // invoke "sumCollect" with array
  client.request('sumCollect', [3, 5, 9, 11], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 28
  });

  // invoke "sumCollect" with object
  client.request('sumCollect', {a: 2, b: 3, c: 4}, function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 9
  });

  // invoke "sumDefault" with object missing some defined members
  client.request('sumDefault', {b: 10}, function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 12
  });

  // invoke "isArray" with an Object
  client.request('isArray', {a: 5, b: 2, c: 9}, function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // true
  });

  client.request('sum', [1, 2, 3], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 6
  });
}

export function test_example_17() {
  var _ = require('lodash');

  var methods = {

    // this function will be wrapped in jayson.Method with options given to the server
    sum: function(args:any, done:any) {
      done(null, sum(args));
    },

    // this method gets the raw params as first arg to handler
    sumCollect: new jayson.Method({
      handler: function(args:any, done:any) {
        var total = sum(args);
        done(null, total);
      },
    }),

    // specifies some default values (alternate definition too)
    sumDefault: new jayson.Method(function(args:any, done:any) {
      var total = sum(args);
      done(null, total);
    }, {
      params: {a: 2, b: 5} // map of defaults
    }),

    // this method returns true when it gets an array (which it always does)
    isArray: new jayson.Method({
      handler: function(args:any, done:any) {
        var result = _.isArray(args);
        done(null, result);
      },
      params: Array // could also be "Object"
    })

  };

  var server = new jayson.Server(methods, {
    // Given as options to jayson.Method when adding the method "sum"
    params: Array
  });

  server.http().listen(3000);

  // sums all numbers in an array
  function sum(list:any) {
    return _.reduce(list, function(sum:any, val:any) {
      return sum + val;
    }, 0);
  }
}

export function test_example_18() {

  var client = jayson.Client.http({
    port: 3000
  });

  client.request('myNameIs', {name: 'Mr. Creosote'}, function(err:any, error:any, result:any) {
    if(err) throw err;
    console.log(result); // 'Your name is: Mr. Creosote'
  });
}

export function test_example_19() {  

  var cors = require('cors');
  var connect = require('connect');
  var jsonParser = require('body-parser').json;
  var app = connect();

  var server = new jayson.Server({
    myNameIs: function(args:any, callback:any) {
      callback(null, 'Your name is: ' + args.name);
    }
  });

  app.use(cors({methods: ['POST']}));
  app.use(jsonParser());
  app.use(server.middleware());

  app.listen(3000);
}

export function test_example_20() {

  var client = jaysonPromise.Client.http({
    port: 3000
  });

  var reqs = [
    client.request('add', [1, 2, 3, 4, 5]),
    client.request('rejection', [])
  ];

  Promise.all(reqs).then(function(responses:any) {
    console.log(responses[0].result);
    console.log(responses[1].error);
  });
}

export function test_example_21() {
  var _ = require('lodash');

  var server = new jayson.Server({

    add: function(args:any) {
      return new Promise(function(resolve, reject) {
        var sum = _.reduce(args, function(sum:any, value:any) { return sum + value; }, 0);
        resolve(sum);
      });
    },

    // example on how to reject
    rejection: function(args:any) {
      return new Promise(function(resolve, reject) {
        // server.error just returns {code: 501, message: 'not implemented'}
        reject(server.error(501, 'not implemented'));
      });
    }

  });

  server.http().listen(3000);
}

export function test_example_22() {

  var server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  // let the backend listen to *:3001
  server.http().listen(3001);
}

export function test_example_23() {

  var client = jayson.Client.http({
    port: 3000 // the port of the frontend server
  });

  client.request('add', [5, 9], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 14
  });
}

export function test_example_24() {

  // create a server where "add" will relay a localhost-only server
  var server = new jayson.Server({
    add: jayson.Client.http({
      port: 3001
    })
  });

  // let the frontend server listen to *:3000
  server.http().listen(3000);
}

export function test_example_25() {
  var fs = require('fs');
  var path = require('path');

  // Read node's tls documentation for more information about these options:
  // https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
  var options = {
    key: fs.readFileSync(path.resolve('./../../../test/fixtures/keys/agent1-key.pem')),
    cert: fs.readFileSync(path.resolve('./../../../test/fixtures/keys/agent1-cert.pem')),

    // This is necessary only if the client uses the self-signed certificate.
    ca: [ fs.readFileSync(path.resolve('./../../../test/fixtures/keys/ca1-cert.pem')) ],
    port: 3000,
    host: 'localhost'
  };

  // create a client
  var client = jayson.Client.tls(options);

  // invoke "add"
  client.request('add', [1, 1], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 2
  });
}

export function test_example_26() {
  var fs = require('fs');
  var path = require('path');

  // Read node's tls documentation for more information about these options:
  // https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
  var options = {
    key: fs.readFileSync(path.resolve('./../../../test/fixtures/keys/agent1-key.pem')),
    cert: fs.readFileSync(path.resolve('./../../../test/fixtures/keys/agent1-cert.pem')),
    requestCert: true,
    // This is necessary only if the client uses the self-signed certificate.
    ca: [ fs.readFileSync(path.resolve('./../../../test/fixtures/keys/ca1-cert.pem')) ],
  };

  // create a server
  var server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  // Bind a http interface to the server and let it listen to localhost:3000
  server.tls(options).listen(3000);
  class Counter {
    count:number;
    constructor(value?:number) {
      this.count = value || 0;
    }
    increment() {
      this.count += 1;
    }
  }

  exports.replacer = function(key:any, value:any) {
    if(value instanceof Counter) {
      return {$class: 'counter', $props: {count: value.count}};
    }
    return value;
  };

  exports.reviver = function(key:any, value:any) {
    if(value && value.$class === 'counter') {
      var obj = new Counter(value.$props.count);
      return obj;
    }
    return value;
  };
}

export function test_example_27() {
  var shared = require('./shared');

  var client = jayson.Client.http({
    port: 3000,
    reviver: shared.reviver,
    replacer: shared.replacer
  });

  // create the object
  var params = {
    counter: new shared.Counter(2)
  };

  // invoke "increment"
  client.request('increment', params, function(err:any, response:any) {
    if(err) throw err;
    var result = response.result;
    console.log(
      result instanceof shared.Counter, // true
      result.count, // 3
      params.counter === result // false - result is a new object
    );
  });
}

export function test_example_28() {
  var shared = require('./shared');

  // Set the reviver/replacer options
  var options = {
    reviver: shared.reviver,
    replacer: shared.replacer
  };

  // create a server
  var server = new jayson.Server({
    increment: function(args:any, callback:any) {
      args.counter.increment();
      callback(null, args.counter);
    }
  }, options);

  server.http().listen(3000);
}

export function test_example_29() {  

  var client = jayson.Client.http({
    port: 3000
  });

  // the third parameter is set to "null" to indicate a notification
  client.request('ping', [], null, function(err:any) {
    if(err) throw err;
    console.log('ok'); // request was received successfully
  });
}

export function test_example_30() {

  var server = new jayson.Server({
    ping: function(args:any, callback:any) {
      // do something, do nothing
      callback();
    }
  });

  server.http().listen(3000);
}

export function test_example_31() {

  // create a client
  var client = jayson.Client.http({
    port: 3000
  });

  // invoke "add_2"
  client.request('add_2', [3], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 5!
  });
}

export function test_example_32() {
  var methods = {
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  };

  var server = new jayson.Server(methods, {
    router: <jayson.ServerRouterFunction>function(method:any, params:any) {
      // regular by-name routing first
      if(typeof(this._methods[method]) === 'function') return this._methods[method];
      if(method === 'add_2') {
        var fn = (server.getMethod('add') as jayson.Method).getHandler() as jayson.MethodHandler;
        return new jayson.Method(function(args:any, done:any) {
          args.unshift(2);
          fn.call(server, args, done);
        });
      }
    }
  });

  server.http().listen(3000);
}

export function test_MethodPromise() {

  const fn1:jaysonPromise.MethodHandlerType = async function(args:jaysonPromise.RequestParamsLike, context:object, callback:jaysonPromise.JSONRPCCallbackTypePlain):Promise<jaysonPromise.JSONRPCResultLike> {
    return {};
  };

  const fn2:jaysonPromise.MethodHandlerType = function(args:jaysonPromise.RequestParamsLike, callback:jaysonPromise.JSONRPCCallbackTypePlain) {
    callback(null, {});
  };

  new jaysonPromise.Method(fn1, {useContext: true});
  new jaysonPromise.Method(fn2);

}

export function test_Method() {

  const fn1:jayson.MethodHandlerType = function(args:jayson.RequestParamsLike, context:object, callback:jayson.JSONRPCCallbackTypePlain) {
    callback(this.error(-32602));
  };

  const fn2:jayson.MethodHandlerType = function(args:jayson.RequestParamsLike, callback:jayson.JSONRPCCallbackTypePlain) {
    callback(null, {});
  };

  new jayson.Method(fn1, {useContext: true});
  new jayson.Method(fn2);

}

export function test_Utils() {

  jayson.Utils.response(null, {}, null, 2);
  jayson.Utils.response({code: 1234, message: 'hello', data: {test: true}}, {}, null, 2);
  jayson.Utils.response({code: 1234, message: 'hello', data: {test: true}}, {}, null, 1);

  jayson.Utils.generateId();

  jayson.Utils.merge({a: true}, {a: false, b: true});

  jayson.Utils.Response.isValidResponse({}, 2);
  jayson.Utils.Response.isValidResponse({});
  jayson.Utils.Response.isValidError({}, 1);
  jayson.Utils.Response.isValidError({});
  jayson.Utils.Request.isValidRequest({}, 1);
  jayson.Utils.Request.isNotification({});
  jayson.Utils.Request.isBatch([]);
  jayson.Utils.Request.isValidRequest({});

  jayson.Utils.JSON.stringify({}, null, function(err?:Error, str?:string) {});
  jayson.Utils.JSON.stringify({}, {}, function(err?:Error, str?:string) {});
  jayson.Utils.JSON.parse('', null, function(err?:Error, data?:object) {});
  jayson.Utils.JSON.parse('', {}, function(err?:Error, data?:object) {});

}
