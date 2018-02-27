# Jayson

Jayson is a [JSON-RPC 2.0][jsonrpc-spec] and [1.0][jsonrpc1-spec] compliant server and client written in JavaScript for [node.js][node.js] that aims to be as simple as possible to use.

[jsonrpc-spec]: http://jsonrpc.org/spec.html 
[jsonrpc1-spec]: http://json-rpc.org/wiki/specification
[node.js]: http://nodejs.org/
[jayson-npm]: https://www.npmjs.com/package/jayson
[jayson-travis]: https://travis-ci.org/tedeh/jayson
[badge-travis]: https://img.shields.io/travis/tedeh/jayson/master.svg?style=flat-square
[badge-npm]: https://img.shields.io/npm/v/jayson.svg?style=flat-square
[badge-downloads-month]: https://img.shields.io/npm/dm/jayson.svg?style=flat-square

[![travis build status][badge-travis]][jayson-travis] 
[![npm version][badge-npm]][jayson-npm]
[![npm][badge-downloads-month]][jayson-npm]

## Table of contents

- [Features](#features)
- [Example](#example)
- [Installation](#installation)
- [Changelog](#changelog-only-notable-milestones)
- [Requirements](#requirements)
- [Class Documentation](#class-documentation)
- [Running tests](#running-tests)
- [Usage](#usage)
  - [Client](#client)
     - [Interface description](#client-interface-description)
     - [Notifications](#notifications)
     - [Batches](#batches)
     - [Callback syntactic sugar](#client-callback-syntactic-sugar)
     - [Events](#client-events)
  - [Server](#server)
     - [Interface description](#server-interface-description)
     - [Many interfaces at the same time](#many-interfaces-at-the-same-time)
     - [Using the server as a relay](#using-the-server-as-a-relay)
     - [Method routing](#method-routing)
     - [Method definition](#method-definition)
     - [Events](#server-events)
     - [Errors](#server-errors)
     - [CORS](#server-cors)
- [Revivers and replacers](#revivers-and-replacers)
- [Named parameters](#named-parameters)
- [Promises](#promises)
  - [Batches](#promise-batches)
- [Contributing](#contributing)

## Features

* [Servers that can listen to several interfaces at the same time](#many-interfaces-at-the-same-time)
* Supports both HTTP and TCP client and server connections
* [Server-side method routing](#method-routing)
* [Relaying of requests to other servers](#using-the-server-as-a-relay)
* [JSON reviving and replacing for transparent serialization of complex objects](#revivers-and-replacers)
* [CLI client](#cli-client)
* [Promises](#promises)
* Fully tested to comply with the [official JSON-RPC 2.0 specification][jsonrpc-spec]
* Also supports [JSON-RPC 1.0][jsonrpc1-spec]

## Example

A basic JSON-RPC 2.0 server via HTTP:

Server example in [examples/simple_example/server.js](examples/simple_example/server.js):

```javascript
var jayson = require('jayson');

// create a server
var server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

server.http().listen(3000);
```

Client example in [examples/simple_example/client.js](examples/simple_example/client.js) invoking `add` on the above server:

```javascript
var jayson = require('jayson');

// create a client
var client = jayson.client.http({
  port: 3000
});

// invoke "add"
client.request('add', [1, 1], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 2
});
```

## Installation

Install the latest version of _jayson_ from [npm](https://github.com/isaacs/npm) by executing `npm install jayson` in your shell. Do a global install with `npm install --global jayson` if you want the `jayson` client CLI in your PATH.

## Changelog (only notable milestones)

- *2.0.0*
  - Added [support for promises](#promises)
  - _Breaking_: `collect: true` is now the default option for a new `jayson.Server` and `jayson.Method`
- *1.2.0*
  - Greatly improved [server method definition](#method-definition)
- *1.1.1*
  - More http server events
  - Remove fork server and client
  - Add server routing
- *1.0.11*
  Add support for a HTTPS client
- *1.0.9*
  Add support for TCP servers and clients

### CLI client

There is a CLI client in `bin/jayson.js` and it should be available as `jayson` in your shell if you installed the package globally. Run `jayson --help` to see how it works.

## Requirements

Jayson does not have any special dependencies that cannot be resolved with a simple `npm install`. It is being [continuously tested][jayson-travis] using [travis-ci](https://travis-ci.org/). You can look inside [.travis.yml](.travis.yml) if you want to see which versions are tested against.

## Class documentation

In addition to this document, a comprehensive class documentation made with [jsdoc][jsdoc-spec] is available at [jayson.tedeh.net](http://jayson.tedeh.net).

[jsdoc-spec]: http://usejsdoc.org/

## Running tests

- Change directory to the repository root
- Install the development packages by executing `npm install --dev`
- Run the tests with `npm run test`

## Usage

### Client

The client is available as the `Client` or `client` property of `require('jayson')`.

#### Client interface description

| Name            | Description     |
| --------------- | --------------- |
| `Client`        | Base class      |
| `Client.tcp`    | TCP interface   |
| `Client.tls`    | TLS interface   |
| `Client.http`   | HTTP interface  |
| `Client.https`  | HTTPS interface |

Every client supports these options:

| Option      	| Default                            	| Type       	| Description                                              	|
|-------------	|------------------------------------	|------------	|----------------------------------------------------------	|
| `reviver`   	| `undefined`                        	| `Function` 	| `JSON.parse` reviver                                    	|
| `replacer`  	| `undefined`                        	| `Function` 	| `JSON.stringify` replacer                               	|
| `generator` 	| [RFC4122][rfc_4122_spec] generator 	| `Function` 	| Generates a `String` for request ID.                     	|
| `version`   	| 2                                  	| `Number`   	| JSON-RPC version to support (1 or 2)                      |

[rfc_4122_spec]: http://www.ietf.org/rfc/rfc4122.txt

##### Client.http

Uses the same options as [http.request][nodejs_docs_http_request] in addition to these options:

| Option     	| Default 	  | Type     	| Description                    	        |
|------------	|------------ |----------	|---------------------------------------- |
| `encoding` 	| `utf8`  	  | `String` 	| Determines the encoding to use 	        |
| `headers` 	| `undefined` | `Object` 	| Extend the headers sent by the client 	|

###### Client.http Events

The HTTP server will emit the following events:

| Event           	| When                              	| Arguments                                                                 	| Notes                                     	|
|-----------------	|-----------------------------------	|---------------------------------------------------------------------------	|-------------------------------------------	|
| `http request`  	| Created an HTTP request           	| 1. Instance of `http.ClientRequest`                                       	|                                           	|
| `http response` 	| Received an HTTP response         	| 1. Instance of `http.IncomingMessage` 2. Instance of `http.ClientRequest` 	|                                           	|
| `http error`    	| Underlying stream emits `error`   	| 1. Error                                                                  	|                                           	|
| `http timeout`  	| Underlying stream emits `timeout` 	|                                                                           	| Automatically causes the request to abort 	|

It is possible to pass a string URL as the first argument. The URL will be run through [url.parse][nodejs_docs_url_parse]. Example:

```javascript
var jayson = require('jayson');
var client = jayson.client.http('http://localhost:3000');
// client.options is now the result of url.parse
```

[nodejs_docs_http_request]: http://nodejs.org/docs/latest/api/http.html#http_http_request_options_callback
[nodejs_docs_url_parse]: http://nodejs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost

##### Client.https

Uses the same options as [https.request][nodejs_docs_https_request] in addition _to the same options as `Client.http`_. This means it is also possible
to pass a string URL as the first argument and have it interpreted by [url.parse][nodejs_docs_url_parse].

Will emit the [same custom events](#clienthttp-events) as `Client.http`.

[nodejs_docs_https_request]: http://nodejs.org/api/all.html#all_https_request_options_callback

##### Client.tcp

Uses the same options as [net.connect][nodejs_docs_net_connect] in addition _to the same options as `Client.http`_.

[nodejs_docs_net_connect]: https://nodejs.org/api/net.html#net_net_connect

##### Client.tls

Uses the same options as [tls.connect][nodejs_docs_tls_connect] in addition _to the same options as `Client.http`_.

[nodejs_docs_tls_connect]: https://nodejs.org/api/tls.html#tls_tls_connect_options_callback

#### Notifications

Notification requests are for cases where the reply from the server is not important and should be ignored. This is accomplished by setting the `id` property of a request object to `null`.

Client example in [examples/notifications/client.js](examples/notifications/client.js) doing a notification request:

```javascript
var jayson = require('jayson');

var client = jayson.client.http({
  port: 3000
});

// the third parameter is set to "null" to indicate a notification
client.request('ping', [], null, function(err) {
  if(err) throw err;
  console.log('ok'); // request was received successfully
});
```

Server example in [examples/notifications/server.js](examples/notifications/server.js):

```javascript
var jayson = require('jayson');

var server = jayson.server({
  ping: function(args, callback) {
    // do something, do nothing
    callback();
  }
});

server.http().listen(3000);
```

##### Notes

* Any value that the server returns will be discarded when doing a notification request.
* Omitting the third argument `null` to `Client.prototype.request` does not generate a notification request. This argument has to be set explicitly to `null` for this to happen.
* Network errors and the like will still reach the callback. When the callback is invoked (with or without error) one can be certain that the server has received the request.
* See the [Official JSON-RPC 2.0 Specification][jsonrpc-spec] for additional information on how Jayson handles notifications that are erroneous.

#### Batches

A batch request is an array of individual requests that are sent to the server as one. Doing a batch request is very simple in Jayson and consists of constructing an array of individual requests (created by not passing a callback to `Client.prototype.request`) that is then itself passed to `Client.prototype.request`. 

Combined server/client example in [examples/batch_request/index.js](examples/batch_request/index.js):

```javascript
var jayson = require('jayson');

var server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

var client = jayson.client(server);

var batch = [
  client.request('does_not_exist', [10, 5]),
  client.request('add', [1, 1]),
  client.request('add', [0, 0], null) // a notification
];

client.request(batch, function(err, errors, successes) {
  if(err) throw err;
  console.log('errors', errors); // array of requests that errored
  console.log('successes', successes); // array of requests that succeeded
});

client.request(batch, function(err, responses) {
  if(err) throw err;
  console.log('responses', responses); // all responses together
});
```

##### Notes

* See the [Official JSON-RPC 2.0 Specification][jsonrpc-spec] for additional information on how Jayson handles different types of batches, mainly with regards to notifications, request errors and so forth.
* There is no guarantee that the results will be in the same order as request Array `request`. To find the right result, compare the ID from the request with the ID in the result yourself.

#### Client callback syntactic sugar

When the length (number of arguments) of a client callback function is either 2 or 3 it receives slightly different values when invoked.

* 2 arguments: first argument is an error or `null`, second argument is the response object as returned (containing _either_ a `result` or a `error` property) or `null` for notifications.
* 3 arguments: first argument is an error or null, second argument is a JSON-RPC `error` property or `null` (if success), third argument is a JSON-RPC `result` property or `null` (if error).

When doing a batch request with a 3-length callback, the second argument will be an array of requests with a `error` property and the third argument will be an array of requests with a `result` property.

#### Client events

A client will emit the following events (in addition to any special ones emitted by a specific interface):

| Event      	| When                        	| Arguments                                     	| Notes 	|
|------------	|-----------------------------	|-----------------------------------------------	|-------	|
| `request`  	| About to dispatch a request 	| 1: Request object                             	|       	|
| `response` 	| Received a response         	| 1: Request object 2: Response object received 	|       	|

### Server

The server classes are available as the `Server` or `server` property of `require('jayson')`.

The server also sports several interfaces that can be accessed as properties of an instance of `Server`.

#### Server interface description

| Name                	| Description                                                                                	|
|---------------------	|--------------------------------------------------------------------------------------------	|
| `Server`            	| Base interface for a server that supports receiving JSON-RPC requests                      	|
| `Server.tcp`        	| TCP server that inherits from [net.Server][nodejs_doc_net_server]                          	|
| `Server.tls`        	| TLS server that inherits from [tls.Server][nodejs_doc_tls_server]                          	|
| `Server.http`       	| HTTP server that inherits from [http.Server][nodejs_doc_http_server]                       	|
| `Server.https`      	| HTTPS server that inherits from [https.Server][nodejs_doc_https_server]                    	|
| `Server.middleware` 	| Method that returns a [Connect][connect]/[Express][express] compatible middleware function 	|

[nodejs_doc_net_server]: http://nodejs.org/docs/latest/api/net.html#net_class_net_server
[nodejs_doc_http_server]: http://nodejs.org/docs/latest/api/http.html#http_class_http_server
[nodejs_doc_https_server]: http://nodejs.org/docs/latest/api/https.html#https_class_https_server
[nodejs_doc_tls_server]: https://nodejs.org/api/tls.html#tls_class_tls_server
[connect]: http://www.senchalabs.org/connect/
[express]: http://expressjs.com/

Servers supports these options:

| Option              	| Default         	| Type                	| Description                                               	|
|---------------------	|-----------------	|---------------------	|-----------------------------------------------------------	|
| `reviver`           	| `null`          	| `Function`          	| `JSON.parse` reviver                                      	|
| `replacer`          	| `null `         	| `Function`          	| `JSON.stringify` replacer                                 	|
| `router`            	| `null `         	| `Function`          	| Return the function for [method routing](#method-routing) 	|
| `collect`           	| `true`          	| `Boolean`           	| Passed to `methodConstructor` options                     	|
| `params`            	| `undefined`     	| `Array/Object/null` 	| Passed to `methodConstructor` options                     	|
| `methodConstructor` 	| `jayson.Method` 	| `Function`          	| Server functions are made an instance of this class       	|
| `version`           	| 2               	| `Number`            	| JSON-RPC version to support (1 or 2)                      	|

##### Server.tcp

Uses the same options as the base class. Inherits from [net.Server][nodejs_doc_net_server].

##### Server.tls

Uses the same options as the base class. Inherits from [tls.Server][nodejs_doc_tls_server].

##### Server.http

Uses the same options as the base class. Inherits from [http.Server][nodejs_doc_http_server].

###### Server.http Events

| Event           	| When                          	| Arguments                                                                    	| Notes 	|
|-----------------	|-------------------------------	|------------------------------------------------------------------------------	|-------	|
| `http request`  	| Incoming HTTP request         	| 1. Instance of `http.IncomingMessage`                                        	|       	|
| `http response` 	| About to send a HTTP response 	| 1. Instance of `http.ServerResponse` 2. Instance of `http. IncomingMessage ` 	|       	|

##### Server.https

Uses the same options as the base class. Inherits from [https.Server][nodejs_doc_https_server] and `jayson.Server.http`. For information on how to configure certificates, [see the documentation on https.Server][nodejs_doc_https_server].

Will emit the [same custom events](#serverhttp-events) as `Server.http`.

##### Server.middleware

Uses the same options as the base class. Returns a function that is compatible with [Connect][connect] or [Express][express]. Will expect the request to be `req.body`, meaning that the request body must be parsed (typically using `connect.bodyParser`) before the middleware is invoked.

The middleware supports the following options:

| Option 	| Default 	| Type      	| Description                                                                               	|
|--------	|---------	|-----------	|-------------------------------------------------------------------------------------------	|
| `end`  	| `true`  	| `Boolean` 	| If set to `false` causes the middleware to `next()` instead of `res.end()` when finished. 	|

Middleware example in [examples/middleware/server.js](examples/middleware/server.js):

```javascript
var jayson = require('jayson');
var jsonParser = require('body-parser').json;
var connect = require('connect');
var app = connect();

var server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

// parse request body before the jayson middleware
app.use(jsonParser());
app.use(server.middleware());

app.listen(3000);
```

#### Many interfaces at the same time

A Jayson server can use many interfaces at the same time.

Server example in [examples/many_interfaces/server.js](examples/many_interfaces/server.js) that listens to both `http` and a `https` requests:

```javascript
var jayson = require('jayson');

var server = jayson.server();

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
```

#### Using the server as a relay

Passing an instance of a client as a method to the server makes the server relay incoming requests to wherever the client is pointing to. This might be used to delegate computationally expensive functions into a separate server or to abstract a cluster of servers behind a common interface.

Frontend server example in [examples/relay/server_public.js](examples/relay/server_public.js) listening on `*:3000`:

```javascript
var jayson = require('jayson');

// create a server where "add" will relay a localhost-only server
var server = jayson.server({
  add: jayson.client.http({
    port: 3001
  })
});

// let the frontend server listen to *:3000
server.http().listen(3000);
```

Backend server example in [examples/relay/server_private.js](examples/relay/server_private.js) listening on `*:3001`:

```javascript
var jayson = require('jayson');

var server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
});

// let the backend listen to *:3001
server.http().listen(3001);
```

Every request to `add` on the public server will now relay the request to the private server. See the client example in [examples/relay/client.js](examples/relay/client.js).

#### Method routing

Passing a property named `router` in the server options will enable you to write your own logic for routing requests to specific functions. 

Server example with custom routing logic in [examples/method_routing/server.js](examples/method_routing/server.js):

```javascript
var jayson = require('jayson');

var methods = {
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  }
};

var server = jayson.server(methods, {
  router: function(method, params) {
    // regular by-name routing first
    if(typeof(this._methods[method]) === 'function') return this._methods[method];
    if(method === 'add_2') {
      var fn = server.getMethod('add').getHandler();
      return new jayson.Method(function(args, done) {
        args.unshift(2);
        fn(args, done);
      });
    }
  }
});

server.http().listen(3000);
```

Client example in [examples/method_routing/client.js](examples/method_routing/client.js) invoking `add_2` on the above server:

```javascript
var jayson = require('jayson');

// create a client
var client = jayson.client.http({
  port: 3000
});

// invoke "add_2"
client.request('add_2', [3], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 5!
});
```

Server example of nested routes where each property is separated by a dot (you do not need to use the router option for this):

```javascript
var _ = require('lodash');
var jayson = require('jayson');

var methods = {
  foo: {
    bar: function(callback) {
      callback(null, 'ping pong');
    }
  },
  math: {
    add: function(args, callback) {
      callback(null, args[0] + args[1]);
    }
  }
};

// this reduction produces an object like this: {'foo.bar': [Function], 'math.add': [Function]}
var map = _.reduce(methods, collapse('', '.'), {});
var server = jayson.server(map);

function collapse(stem, sep) {
  return function(map, value, key) {
    var prop = stem ? stem + sep + key : key;
    if(_.isFunction(value)) map[prop] = value;
    else if(_.isObject(value)) map = _.reduce(value, collapse(prop, sep), map);
    return map;
  }
}
```

##### Notes

* If `router` does not return anything, the server will respond with a `Method Not Found` error.
* The `Server.prototype` methods `method`, `methods`, `removeMethod` and `hasMethod` will not use the `router` method, but will operate on the internal `Server.prototype._methods` map.
* The `router` method is expected to return instances of `jayson.Method` (>=1.2.0)

#### Method definition

You can also define server methods inside a wrapping object named `jayson.Method`. This allows additional options about the method to be specified. Using this wrapper - explicitly or implicitly (via server options) - makes it trivial to have your method accept a variable amount of arguments.

The method class is available as the `Method` or `method` property of  `require('jayson')`. It supports these options:

| Option    	| Default                        	| Type                	| Description                                                            	|
|-----------	|--------------------------------	|---------------------	|------------------------------------------------------------------------	|
| `handler` 	|                                	| `Function`          	| The actual function that will handle a JSON-RPC request to this method 	|
| `collect` 	| >= 2.0.0 `true` before `false` 	| `Boolean`           	| Collect JSON-RPC parameters in a single function argument              	|
| `params`  	| null                           	| `Array|Object|null` 	| Force JSON-RPC parameters to be of a certain type                      	|

Server example showcasing most features and options in [examples/method_definitions/server.js](examples/method_definitions/server.js):

```javascript
var jayson = require('jayson');
var _ = require('lodash');

var methods = {

  // this function will be wrapped in jayson.Method with options given to the server
  sum: function(args, done) {
    done(null, sum(args));
  },

  // this method gets the raw params as first arg to handler
  sumCollect: new jayson.Method({
    handler: function(args, done) {
      var total = sum(args);
      done(null, total);
    },
    collect: true // means "collect all JSON-RPC parameters in one arg"
  }),

  // specifies some default values (alternate definition too)
  sumDefault: jayson.Method(function(args, done) {
    var total = sum(args);
    done(null, total);
  }, {
    collect: true,
    params: {a: 2, b: 5} // map of defaults
  }),

  // this method returns true when it gets an array (which it always does)
  isArray: new jayson.Method({
    handler: function(args, done) {
      var result = _.isArray(args);
      done(null, result);
    },
    collect: true,
    params: Array // could also be "Object"
  })

};

var server = jayson.server(methods, {
  // Given as options to jayson.Method when adding the method "sum"
  collect: true,
  params: Array
});

server.http().listen(3000);

// sums all numbers in an array
function sum(list) {
  return _.reduce(list, function(sum, val) {
    return sum + val;
  }, 0);
}
```

Client example in [examples/method_definitions/client.js](examples/method_definitions/client.js):

```javascript
var jayson = require('jayson');

var client = jayson.client.http({
  port: 3000
});

// invoke "sumCollect" with array
client.request('sumCollect', [3, 5, 9, 11], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 28
});

// invoke "sumCollect" with object
client.request('sumCollect', {a: 2, b: 3, c: 4}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // 9
});

// invoke "sumDefault" with object missing some defined members
client.request('sumDefault', {b: 10}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // 12
});

// invoke "isArray" with an Object
client.request('isArray', {a: 5, b: 2, c: 9}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // true
});

client.request('sum', [1, 2, 3], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 6
});
```

##### Notes

* Adding methods as a plain JavaScript function creates an instance of `jayson.Method` internally. For backwards compatibility it will be created with the option "collect" set to `false` (v2.0.0). It is possible to affect this by passing the `collect` option to the server. This works similarly for the `params` option.

#### Server events

In addition to events that are specific to certain interfaces, all servers will emit the following events:

| Event      	| When                                     	| Arguments                            	| Notes                          	|
|------------	|------------------------------------------	|--------------------------------------	|--------------------------------	|
| `request`  	| Interpretable non-batch request received 	| 1: Request object                    	|                                	|
| `response` 	| Returning a response                     	| 1: Request object 2: Response object 	|                                	|
| `batch`    	| Interpretable batch request received     	| 1. Array of requests                 	| Emits `request` for every part 	|

#### Server Errors

If you should like to return an error from an method request to indicate a failure, remember that the [JSON-RPC 2.0][jsonrpc-spec] specification requires the error to be an `Object` with a `code (Integer/Number)` to be regarded as valid. You can also provide a `message (String)` and a `data (Object)` with additional information. Example: 

```javascript
var jayson = require('jayson');

var server = jayson.server({
  i_cant_find_anything: function(args, callback) {
    var error = {code: 404, message: 'Cannot find ' + args.id};
    callback(error); // will return the error object as given
  },
  i_cant_return_a_valid_error: function(callback) {
    callback({message: 'I forgot to enter a code'}); // will return a pre-defined "Internal Error"
  }
});
```

##### Predefined Errors

It is also possible to cause a method to return one of the predefined [JSON-RPC 2.0 error codes][jsonrpc-spec#error_object] using the server helper function `Server.prototype.error` inside of a server method. Example:

[jsonrpc-spec#error_object]: http://jsonrpc.org/spec.html#error_object

```javascript
var jayson = require('jayson');

var server = jayson.server({
  invalid_params: function(args, callback) {
    var error = this.error(-32602); // returns an error with the default properties set
    callback(error);
  }
});
```

You can even override the default messages:

```javascript
var jayson = require('jayson');

var server = jayson.server({
  error_giver_of_doom: function(callback) {
    callback(true) // invalid error format, which causes an Internal Error to be returned instead
  }
});

// Override the default message
server.errorMessages[Server.errors.INTERNAL_ERROR] = 'I has a sad. I cant do anything right';
```

#### Server CORS

Jayson does not include functionality for supporting CORS requests natively but it is easy to use a CORS-enabling middleware
like [cors](https://github.com/expressjs/cors). An example of this can be found in [examples/cors/server.js](examples/cors/server.js):

```javascript
var jayson = require('jayson');
var cors = require('cors');
var connect = require('connect');
var jsonParser = require('body-parser').json;
var app = connect();

var server = jayson.server({
  myNameIs: function(args, callback) {
    callback(null, 'Your name is: ' + args.name);
  }
});

app.use(cors({methods: ['POST']}));
app.use(jsonParser());
app.use(server.middleware());

app.listen(3000);
```

### Revivers and Replacers

JSON lacks support for representing types other than the simple ones defined in the [JSON specification][jsonrpc-spec]. Fortunately the JSON methods in JavaScript (`JSON.parse` and `JSON.stringify`) provide options for custom serialization/deserialization routines. Jayson allows you to pass your own routines as options to both clients and servers.

Simple example transferring the state of an object between a client and a server:

Shared code between the server and the client in [examples/reviving_and_replacing/shared.js](examples/reviving_and_replacing/shared.js):

```javascript
var Counter = exports.Counter = function(value) {
  this.count = value || 0;
};

Counter.prototype.increment = function() {
  this.count += 1;
};

exports.replacer = function(key, value) {
  if(value instanceof Counter) {
    return {$class: 'counter', $props: {count: value.count}};
  }
  return value;
};

exports.reviver = function(key, value) {
  if(value && value.$class === 'counter') {
    var obj = new Counter();
    for(var prop in value.$props) obj[prop] = value.$props[prop];
    return obj;
  }
  return value;
};
```

Server example in [examples/reviving_and_replacing/server.js](examples/reviving_and_replacing/server.js):

```javascript
var jayson = require('jayson');
var shared = require('./shared');

// Set the reviver/replacer options
var options = {
  reviver: shared.reviver,
  replacer: shared.replacer
};

// create a server
var server = jayson.server({
  increment: function(args, callback) {
    args.counter.increment();
    callback(null, args.counter);
  }
}, options);

server.http().listen(3000);
```

A client example in [examples/reviving_and_replacing/client.js](examples/reviving_and_replacing/client.js) invoking "increment" on the server:

```javascript
var jayson = require('jayson');
var shared = require('./shared');

var client = jayson.client.http({
  port: 3000,
  reviver: shared.reviver,
  replacer: shared.replacer
});

// create the object
var params = {
  counter: new shared.Counter(2)
}

// invoke "increment"
client.request('increment', params, function(err, response) {
  if(err) throw err;
  var result = response.result;
  console.log(
    result instanceof shared.Counter, // true
    result.count, // 3
    params.counter === result // false - result is a new object
  );
});
```

#### Notes

* Instead of using a replacer, it is possible to define a `toJSON` method for any JavaScript object. Unfortunately there is no corresponding method for reviving objects (that would not work, obviously), so the _reviver_ always has to be set up manually.

### Named parameters

It is possible to specify named parameters when doing a client request by passing an Object instead of an Array.

Client example in [examples/named_parameters/client.js](examples/named_parameters/client.js):

```javascript
var jayson = require('jayson');

var client = jayson.client.http({
  port: 3000
});

client.request('add', {b: 1, a: 2}, function(err, response) {
  if(err) throw err;
  console.log(response.result); // 3!
});
```

Server example in [examples/named_parameters/server.js](examples/named_parameters/server.js):

```javascript
var jayson = require('jayson');

var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
}, {
  collect: false // don't collect params in a single argument
});

server.http().listen(3000);
```

#### Notes

* If requesting methods on a Jayson server, arguments left out will be `undefined`
* Too many arguments or arguments with invalid names will be ignored
* It is assumed that the last argument to a server method is the callback and it will not be filled with something else
* Parsing a function signature and filling in arguments is generally *not recommended* and should be avoided

### Promises

[es6-promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

*Since version 2.0.0*

A separate tree that does limited usage of the [ES6 Promise][es6-promise] object is available. The internal API remains callback based, with the addition that promises may be used for two things:

* Returning a Promise when requesting a JSON-RPC method using a Client
* Returning a Promise inside of a Server method

To use the separate tree, do a `require('jayson/promise')` instead of `require('jayson')`.

Server example in [examples/promise/server.js](examples/promise/server.js) showing how to return a `Promise` in a server method:

```javascript
var jayson = require('../../promise');
var _ = require('lodash');

var server = jayson.server({

  add: function(args) {
    return new Promise(function(resolve, reject) {
      var sum = _.reduce(args, function(sum, value) { return sum + value; }, 0);
      resolve(sum);
    });
  },

  // example on how to reject
  rejection: function(args) {
    return new Promise(function(resolve, reject) {
      // server.error just returns {code: 501, message: 'not implemented'}
      reject(server.error(501, 'not implemented'));
    });
  }

});

server.http().listen(3000);
```

Client example in [examples/promise/client.js](examples/promise/client.js) showing how to do a request:

```javascript
var jayson = require('../../promise');

var client = jayson.client.http({
  port: 3000
});

var reqs = [
  client.request('add', [1, 2, 3, 4, 5]),
  client.request('rejection', [])
];

Promise.all(reqs).then(function(responses) {
  console.log(responses[0].result);
  console.log(responses[1].error);
});
```

#### Notes

* JSON-RPC errors will not result in rejection of the Promise. It is however possible that a future version will include a client setting to have JSON-RPC errors result in rejection. Please note that network errors and the like will result in rejection.
* A `Promise` is considered to have been returned from a server method if the returned object has a property `then` that is a function.

#### Promise Batches

*Since version 2.0.5*

Sometimes you may want to return raw requests from a promise client. This needs to be handled differently, because `PromiseClient.prototype.request` would normally always be expected to *return a Promise* which we in this case don't want.

To solve this, we need to set the fourth parameter to `PromiseClient.prototype.request` explicitly to `false` in order to *not* return a Promise.

Client example in [examples/promise_batches/client.js](examples/promise/client.js) showing how to properly execute a batch request:

```javascript
var jayson = require('../../promise');

var client = jayson.client.http({
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
```

##### Notes

* The third parameter to `PromiseClient.prototype.request` above is explicitly set to `undefined` - this parameter would normally represent the desired ID of the call. Remember that `null` would mean a notification (which does not return a response) and other falsy values may actually be used as ids. Setting `undefined` ensures that the id is generated automatically.

### Contributing

Highlighting [issues](https://github.com/tedeh/jayson/issues) or submitting pull
requests on [Github](https://github.com/tedeh/jayson) is most welcome.

Please make sure to follow the style of the project, and lint your code with `npm run lint` before submitting a patch.
