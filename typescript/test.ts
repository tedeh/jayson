import * as jayson from './..';
import * as jaysonPromise from './../promise';
import jaysonBrowserClient from './../lib/client/browser';
import jaysonPromiseBrowserClient from './../promise/lib/client/browser';
import { reduce, isArray } from 'lodash';
import { Express } from 'express-serve-static-core';
import WebSocket from 'isomorphic-ws';

/**
 * This file contains tests for the typescript type definitions.
 * Most of them are based on the examples files.
 */

export function test_example_1() {
  const jsonParser = require('body-parser').json;
  const connect = require('connect');
  const app = connect();

  const server = new jayson.Server({
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

  const server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  const client = new jayson.Client(server);

  const batch = [
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

  const client = jayson.Client.https({
    port: 3000
  });

  client.request('multiply', [5, 5], function(err, error, result) {
    if(err) throw err;
    console.log(result); // 25
  });
}

export function test_example_4() {

  const server = new jayson.Server({
    multiply: function(args:any, callback:any) {
      callback(null, args[0] * args[1]);
    }
  });

  server.https().listen(3000, function() {
    console.log('Server listening on http://localhost:3000');
  });
}

export function test_example_5() {
  const fs = require('fs');
  const path = require('path');

  const options = {
    port: 3000,
    host: 'localhost'
  };

  // create a client
  const client = jayson.Client.tcp(options);

  // invoke "add"
  client.request('add', [1, 1], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 2
  });
}

export function test_example_6() {
  const fs = require('fs');
  const path = require('path');

  const options = {
  };

  // create a server
  const server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  // Bind a http interface to the server and let it listen to localhost:3000
  server.tcp(options).listen(3000);
}

export function test_example_7() {

  const client = jayson.Client.http({
    port: 3000
  });

  client.request('multiply', [5, 5], function(err:any, error:any, result:any) {
    if(err) throw err;
    console.log(result); // 25
  });
}

export function test_example_8() {

  const server = new jayson.Server({
    multiply: function(args:any, callback:any) {
      callback(null, args[0] * args[1]);
    }
  });

  server.http().listen(3000, function() {
    console.log('Server listening on http://localhost:3000');
  });
}

export function test_example_9() {

  const client = jaysonPromise.Client.http({
    port: 3000
  });

  const batch = [
    client.request('add', [1, 2, 3, 4, 5], undefined, false),
    client.request('add', [5, 6, 7, 8, 9], undefined, false),
  ];

  client.request(batch).then(function(responses) {
    console.log(responses[0].result); // 15
    console.log(responses[1].result); // 35
  });
}

export function test_example_10() {

  const server = new jayson.Server({

    add: function(args:any) {
      return new Promise(function(resolve, reject) {
        const sum = reduce(args, function(sum:number, value:number) { return sum + value; }, 0);
        resolve(sum);
      });
    }

  });

  server.http().listen(3000);
}

export function test_example_11() {

  const server = new jayson.Server();

  // "http" will be an instance of require('http').Server
  const http = server.http();

  // "https" will be an instance of require('https').Server
  const https = server.https({
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

  const client = jayson.Client.http({
    port: 3000
  });

  client.request('add', {b: 1, a: 2}, function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 3!
  });
}

export function test_example_13() {

  const server = new jayson.Server({
    add: function(a:any, b:any, callback:any) {
      callback(null, a + b);
    }
  }, {
  });

  server.http().listen(3000);
}

export function test_example_14() {

  // create a client
  const client = jayson.Client.http({
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
  const server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  server.http().listen(3000);
}

export function test_example_16() {

  const client = jayson.Client.http({
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
  const methods = {

    // this function will be wrapped in jayson.Method with options given to the server
    sum: function(args:any, done:any) {
      done(null, sum(args));
    },

    // this method gets the raw params as first arg to handler
    sumCollect: new jayson.Method({
      handler: function(args:any, done:any) {
        const total = sum(args);
        done(null, total);
      },
    }),

    // specifies some default values (alternate definition too)
    sumDefault: new jayson.Method(function(args:any, done:any) {
      const total = sum(args);
      done(null, total);
    }, {
      params: {a: 2, b: 5} // map of defaults
    }),

    // this method returns true when it gets an array (which it always does)
    isArray: new jayson.Method({
      handler: function(args:any, done:any) {
        const result = isArray(args);
        done(null, result);
      },
      params: Array // could also be "Object"
    })

  };

  const server = new jayson.Server(methods, {
    // Given as options to jayson.Method when adding the method "sum"
    params: Array
  });

  server.http().listen(3000);

  // sums all numbers in an array
  function sum(list:any) {
    return reduce(list, function(sum:any, val:any) {
      return sum + val;
    }, 0);
  }
}

export function test_example_18() {

  const client = jayson.Client.http({
    port: 3000
  });

  client.request('myNameIs', {name: 'Mr. Creosote'}, function(err:any, error:any, result:any) {
    if(err) throw err;
    console.log(result); // 'Your name is: Mr. Creosote'
  });
}

export function test_example_19() {  

  const cors = require('cors');
  const connect = require('connect');
  const jsonParser = require('body-parser').json;
  const app = connect();

  const server = new jayson.Server({
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

  const client = jaysonPromise.Client.http({
    port: 3000
  });

  const reqs = [
    client.request('add', [1, 2, 3, 4, 5]),
    client.request('rejection', [])
  ];

  Promise.all(reqs).then(function(responses:any) {
    console.log(responses[0].result);
    console.log(responses[1].error);
  });
}

export function test_example_21() {

  const server = new jayson.Server({

    add: function(args:any) {
      return new Promise(function(resolve, reject) {
        const sum = reduce(args, function(sum:any, value:any) { return sum + value; }, 0);
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

  const server = new jayson.Server({
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  // let the backend listen to *:3001
  server.http().listen(3001);
}

export function test_example_23() {

  const client = jayson.Client.http({
    port: 3000 // the port of the frontend server
  });

  client.request('add', [5, 9], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 14
  });
}

export function test_example_24() {

  // create a server where "add" will relay a localhost-only server
  const server = new jayson.Server({
    add: jayson.Client.http({
      port: 3001
    })
  });

  // let the frontend server listen to *:3000
  server.http().listen(3000);
}

export function test_example_25() {
  const fs = require('fs');
  const path = require('path');

  // Read node's tls documentation for more information about these options:
  // https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
  const options = {
    key: fs.readFileSync(path.resolve('./../../../test/fixtures/keys/agent1-key.pem')),
    cert: fs.readFileSync(path.resolve('./../../../test/fixtures/keys/agent1-cert.pem')),

    // This is necessary only if the client uses the self-signed certificate.
    ca: [ fs.readFileSync(path.resolve('./../../../test/fixtures/keys/ca1-cert.pem')) ],
    port: 3000,
    host: 'localhost'
  };

  // create a client
  const client = jayson.Client.tls(options);

  // invoke "add"
  client.request('add', [1, 1], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 2
  });
}

export function test_example_26() {
  const fs = require('fs');
  const path = require('path');

  // Read node's tls documentation for more information about these options:
  // https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
  const options = {
    key: fs.readFileSync(path.resolve('./../../../test/fixtures/keys/agent1-key.pem')),
    cert: fs.readFileSync(path.resolve('./../../../test/fixtures/keys/agent1-cert.pem')),
    requestCert: true,
    // This is necessary only if the client uses the self-signed certificate.
    ca: [ fs.readFileSync(path.resolve('./../../../test/fixtures/keys/ca1-cert.pem')) ],
  };

  // create a server
  const server = new jayson.Server({
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
      const obj = new Counter(value.$props.count);
      return obj;
    }
    return value;
  };
}

export function test_example_27() {
  const shared = require('./shared');

  const client = jayson.Client.http({
    port: 3000,
    reviver: shared.reviver,
    replacer: shared.replacer
  });

  // create the object
  const params = {
    counter: new shared.Counter(2)
  };

  // invoke "increment"
  client.request('increment', params, function(err:any, response:any) {
    if(err) throw err;
    const result = response.result;
    console.log(
      result instanceof shared.Counter, // true
      result.count, // 3
      params.counter === result // false - result is a new object
    );
  });
}

export function test_example_28() {
  const shared = require('./shared');

  // Set the reviver/replacer options
  const options = {
    reviver: shared.reviver,
    replacer: shared.replacer
  };

  // create a server
  const server = new jayson.Server({
    increment: function(args:any, callback:any) {
      args.counter.increment();
      callback(null, args.counter);
    }
  }, options);

  server.http().listen(3000);
}

export function test_example_29() {  

  const client = jayson.Client.http({
    port: 3000
  });

  // the third parameter is set to "null" to indicate a notification
  client.request('ping', [], null, function(err:any) {
    if(err) throw err;
    console.log('ok'); // request was received successfully
  });
}

export function test_example_30() {

  const server = new jayson.Server({
    ping: function(args:any, callback:any) {
      // do something, do nothing
      callback();
    }
  });

  server.http().listen(3000);
}

export function test_example_31() {

  // create a client
  const client = jayson.Client.http({
    port: 3000
  });

  // invoke "add_2"
  client.request('add_2', [3], function(err:any, response:any) {
    if(err) throw err;
    console.log(response.result); // 5!
  });
}

export function test_example_32() {
  const methods = {
    add: function(args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  };

  const server = new jayson.Server(methods, {
    router: <jayson.ServerRouterFunction>function(method:any, params:any) {
      // regular by-name routing first
      if(typeof(this._methods[method]) === 'function') return this._methods[method];
      if(method === 'add_2') {
        const fn = (server.getMethod('add') as jayson.Method).getHandler() as jayson.MethodHandler;
        return new jayson.Method(function(args:any, done:any) {
          args.unshift(2);
          fn.call(server, args, done);
        });
      }
    }
  });

  server.http().listen(3000);
}

export function test_Middleware() {
  const app = require('express') as Express;

  const server = new jayson.Server({
    add: function (args:any, callback:any) {
      callback(null, args[0] + args[1]);
    }
  });

  const jsonParser = require('body-parser').json;
  // parse request body before the jayson middleware
  app.use(jsonParser());
  app.use(server.middleware());

  app.listen(3000);
}

export function test_ServerOptions() {
  const server = new jayson.Server({}, {
    useContext: true,
  });

  server.options.useContext = false;
  server.errorMessages[jayson.Server.errors.PARSE_ERROR] = 'This is a parse error';
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

  const methodWithContext = new jayson.Method(fn1, {useContext: true});
  const methodWithoutContext = new jayson.Method(fn2);

  const server = new jayson.Server({}, {useContext: true});

  // called with and without context
  methodWithContext.execute(server, {}, {}, function () {});
  methodWithContext.execute(server, {}, function () {});
}

export function test_Utils() {
  jayson.Utils.response(null, {}, null, 2);
  jayson.Utils.response({code: 1234, message: 'hello', data: {test: true}}, {}, null, 2);
  jayson.Utils.response({code: 1234, message: 'hello', data: {test: true}}, {}, null, 1);

  jayson.Utils.request('add', [1, 2]);
  jayson.Utils.request('add', {a: 1, b: 2});
  jayson.Utils.request('add', {}, 'asdf');
  jayson.Utils.request('add', {}, 2);
  jayson.Utils.request('add', {}, null, {version: 1});
  jayson.Utils.request('add', {}, null, {notificationIdNull: true});
  jayson.Utils.request('add', {}, undefined, {
    generator: ():number => Math.random(),
  });

  jayson.Utils.request('add', {}, {
    generator: ():number => Math.random(),
  });

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

export function test_ServerEventEmitter() {
  const server = new jayson.Server({}, {
    useContext: true,
  });

  server.on('request', function(request:jayson.JSONRPCRequestLike) {
  });

  server.on('response', function(request:jayson.JSONRPCRequestLike, response:jayson.JSONRPCRequestLike) {
  });
}

export function test_clientBrowser () {
  const shared = require('./shared');

  const callServer = function(request:string, callback:((err?:Error | null, response?:string) => void)) {
    callback(null, '{}');
  };

  const client = new jaysonBrowserClient(callServer, {
    reviver: shared.reviver,
    replacer: shared.replacer,
    generator: () => String(Math.round(Math.random() * 10000)),
    version: 2,
  });

  client.request('multiply', [5, 5], function(err?: Error | null, error?: jayson.JSONRPCErrorLike, result?: jayson.JSONRPCResultLike) {
    if(err) throw err;
    console.log(result); // 25
  });
  client.request('multiply', [5, 5], '2', function(err?: Error | null, error?: jayson.JSONRPCErrorLike, result?: jayson.JSONRPCResultLike) {
    if(err) throw err;
    console.log(result); // 25
  });
  const r1 = client.request('multiply', {asdf: true});
  const r2 = client.request('multiply', [3, 9]);
  client.request([r1, r2], function (err: jayson.JSONRPCErrorLike, results?: Array<jayson.JSONRPCResultLike>) {
    if(err) throw err;
    console.log(results); // 25
  });
}

export function test_clientBrowserPromise () {
  const shared = require('./shared');

  const callServer = function(request:string):Promise<string> {
    return Promise.resolve(JSON.stringify({code: -1, message: 'we have an error'}));
  };

  const client = new jaysonPromiseBrowserClient(callServer, {
    reviver: shared.reviver,
    replacer: shared.replacer,
    generator: () => String(Math.round(Math.random() * 10000)),
    version: 2,
  });

  client.request('multiply', [5, 5]).then(function (response) {});
  client.request('multiply', [5, 5], '2').then(function (response) {});
  const r1 = client.request('multiply', {asdf: true}, undefined, false);
  const r2 = client.request('multiply', [3, 9], undefined, false);
  client.request([r1, r2]).then(function (response) {});
}

export function test_server_and_method_call () {
  const server = new jayson.Server();
  const request = jayson.Utils.request('add', [1, 2], undefined, {generator: () => Math.random()});
  server.call(request, {}, function (err, result) {});
  server.call(request, function (err, result) {});
  server.call(request, {}, function (err?:jayson.JSONRPCResponseWithError | null, result?: jayson.JSONRPCResponseWithResult) {
    if (err) {
      console.log(err.error);
    } else {
      console.log(result);
    }
  });
}

export function test_websocket () {
  const wss = new WebSocket.Server({port: 12345});
  const server = new jayson.Server();
  const websocketServer = server.websocket({wss});

  const ws = new WebSocket('ws://localhost:12345');
  const websocketClient = jayson.Client.websocket({
    url: 'ws://localhost:12345',
    ws,
    timeout: 5000,
  });
}

export async function test_websocket_Promise () {
  const wss = new WebSocket.Server({port: 12345});
  const server = new jaysonPromise.Server();
  const websocketServer = server.websocket({wss});

  const ws = new WebSocket('ws://localhost:12345');
  const websocketClient = jaysonPromise.Client.websocket({
    url: 'ws://localhost:12345',
    ws,
    timeout: 5000,
  });

  const result = await websocketClient.request('add', [1,2,3]);
}

export async function test_differentCases () {
  jayson.client.http({host: 'http://something', port: 80});
  // new jayson.client.http({host: 'http://something', port: 80}); // gives error
  jaysonPromise.client.http({port: 3000});
  // jayson.server(); // gives error
  const server = new jayson.server();
  new jayson.client(server);
  new jayson.Client(server);
  new jayson.Method();
  new jayson.method();
  // jayson.Method(); // gives error
  // jayson.method(); // givers error
  // jayson.client(server); // gives error
  // jayson.Client(server); // gives error
  jayson.Utils.response(null, null, 1, 2);
  jayson.utils.response(null, null, 1, 2);
}

export function test_constructors () {
  const server = jayson.Server();
  const client = jayson.Client(server);
  const method = jayson.Method();
}

export function test_constructors_promise () {
  const server = jaysonPromise.Server();
  const client = jaysonPromise.Client(server);
  const method = jaysonPromise.Method();
}
