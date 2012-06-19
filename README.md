# Jayson

Jayson is a [JSON-RPC 2.0 compliant][jsonrpc-spec] server and client written in [nodejs/javascript][node.js] that wants to be as simple as possible to use.

[jsonrpc-spec]: http://jsonrpc.org/spec.html 
[node.js]: http://nodejs.org/

## Features

* Servers that listen to many interfaces at once
* Supports HTTP client and server connections
* jQuery AJAX client
* Automatic request relaying to other servers 
* Simple process forking for expensive computations
* JSON Reviving and Replacing for advanced (de)serialization of objects
* Fully tested to comply with the [official specification][jsonrpc-spec]

## Example

A very basic JSON-RPC 2.0 server via HTTP:

```javascript
// server.js
var jayson = require('jayson');

// create a server
var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

// Bind a http interface to the server and let it listen to localhost:3000
server.http().listen(3000);
```

A client invoking `add` on the above server:

```javascript
// client.js
var jayson = require('jayson');

// create a client
var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost'
});

// invoke "add"
client.request('add', [1, 1], function(err, error, response) {
  if(err) throw err;
  console.log(response); // 2!
});
```

## Installation

Install the latest version of _jayson_ from [npm](https://github.com/isaacs/npm) by executing `npm install jayson` in your shell. Do a global install with `npm install --global jayson` if you want the `jayson` client binary in your PATH.

## Requirements

Jayson does not have any special dependencies that cannot be resolved with a simple `npm install`. It has been tested with the following node.js versions:

- node.js v0.4.x (stable branch)
- node.js v0.6.x (stable branch)
- node.js v0.7.x (dev branch)

### Running tests

- Change directory to the repository root
- Install the testing framework
  ([mocha](https://github.com/visionmedia/mocha) together with
  [should](https://github.com/visionmedia/should.js)) by executing `npm install
  --dev`
- Run the tests with `make test` or `npm test`

## Usage

### Client

The client is available as the `Client` or `client` property of `require('jayson')`.

#### Client interfaces

* `Client` Base class for interfacing with a server.
* `Client.http` HTTP interface. See [http.request](http://nodejs.org/docs/v0.6.19/api/http.html#http_http_request_options_callback) for supported options.
* `Client.fork` Node.js child_process/fork interface.
* `Client.jquery` Wrapper around `jQuery.ajax`.

[nodejs_doc_http_request]

#### Notification requests

Notification requests are for cases where the reply from the server is not important and should be ignored. This is accomplished by setting the `id` property of a request object to `null`.

A client doing a notification request:

```javascript
// client.js
var jayson = require('jayson');
var client = jayson.client.http({
  host: 'localhost',
  port: 3000
});

// the third parameter is set to "null" to indicate a notification
client.request('ping', [], null, function(err) {
  if(err) throw err;
  // request was received successfully
});
```
A server:

```javascript
// server.js
var jayson = require('jayson');

var server = jayson.server({
  ping: function(callback) {
    // do something
    callback();
  }
});

server.http().listen(3000);
```

##### Notes

* Any value that the server returns will be discarded when doing a notification request.
* Omitting the third argument `null` to `client.prototype.request` does not generate a notification request. This argument has to be set explicitly to `null` for this to happen.
* Network errors and the like will still reach the callback. When the callback is invoked (with or without error) one can be certain that the server has received the request.
* See the [Official JSON-RPC 2.0 Specification][jsonrpc-spec] for additional information on how Jayson handles notifications that are erroneous.

#### Batch requests

A batch request is an array of individual requests that are sent to the server as one. Doing a batch request is very simple in Jayson and consists of constructing an `Array` of individual requests (created by not passing a callback to `Client.prototype.request`) that is then passed into `Client.prototype.request`. 

Client example in `examples/batch_request/client.js`:

```javascript
var jayson = require(__dirname + '/../..');
var client = jayson.client.http({
  host: 'localhost',
  port: 3000
});

var batch = [
  client.request('does_not_exist', [10, 5]),
  client.request('add', [1, 1]),
  client.request('add', [0, 0], null) // a notification
];

// callback takes three arguments (first type of callback)
client.request(batch, function(err, errors, successes) {
  if(err) throw err;
  // errors is an array of the requests that errored
  console.log('errors', errors);
  // successes is an array of requests that succeded
  console.log('successes', successes);
});

// callback takes two arguments (second type of callback)
client.request(batch, function(err, responses) {
  if(err) throw err;
  // responses is an array of errors and successes together
  console.log('responses', responses);
});
```

Server example in `examples/batch_request/server.js`:

```javascript
var jayson = require('jayson');

var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  },
  subtract: function(a, b, callback) {
    callback(null, a - b);
  }
});

server.http().listen(3000);
```

##### Notes

* See the [Official JSON-RPC 2.0 Specification][jsonrpc-spec] for additional information on how Jayson handles different types of batches, mainly with regards to notifications, request errors and so forth.
* There is no guarantee that the results will be in the same order as request Array `request`. To find the right result, compare the ID from the batch with the ID in the result.

#### Client interfaces

##### Client.http

TODO Document the HTTP client

##### Client.fork

TODO Document the fork client

##### Client.jquery

TODO Document the jquery client

#### Client methods

The Client class is accessible via `require('jayson').Client`. All interfaces inherit the following methods from this class:

##### Client.prototype.request(method, params, [id, [callback]])

Creates a request and executes it, or returns a request object.

* `method` `String` Name of method to call
* `params` `Object|Array` Parameters to pass to the method.
* `[id]` `String|Number` Optional ID. If null, indicates a notification request.
* `[callback]` Function` Optional callback. If not set, returns a request (typically used for creating batches) rather than immediately dispatching it.

### Server

The server classes are available as the `Server` or `server` property of `require('jayson')`.

The server also sports several interfaces that can be accessed as properties of an instance of `Server`.

#### Server interfaces

* `Server` - Base interface for a server that supports receiving JSON-RPC 2.0 requests.
* `Server.http` - HTTP server that inherits from [http.Server][nodejs_doc_http_server].
* `Server.https` - HTTPS server that inherits from [https.Server][nodejs_doc_http_server].
* `Server.middleware` - Method that returns a [Connect][connect]/[Express][express] compatible middleware function.
* `Server.fork` Creates a child process that can take requests via `client.fork`

[nodejs_doc_http_server]: http://nodejs.org/docs/latest/api/http.html#http_class_http_server
[nodejs_doc_https_server]: http://nodejs.org/docs/latest/api/https.html#https_class_https_server
[connect]: http://www.senchalabs.org/connect/
[express]: http://expressjs.com/

##### Server.http(s)

TODO Document the http interface.

##### Server.middleware

TODO Document the middleware interface.

##### Server.fork

TODO Document the fork server.

##### Using many interfaces at the same time

A Jayson server can use many interfaces at the same time.

Example of a server that listens has both can take both `http` and a `https` requests:

```javascript
var jayson = require('jayson');

var server = jayson.server({
  add: function(a, b, callback) { return callback(null, a + b); }
});

// http is now an instance of require('http').Server
var http = server.http();

// https is now an instance of require('https').Server
var https = server.https({
  cert: require('fs').readFileSync('cert.pem'),
  key require('fs').readFileSync('key.pem')
});

http.listen(80); // let http listen to localhost:3000

https.listen(443); // let https listen to localhost:443
```

#### Using the server as a relay

Passing an instance of a client as a method (to the server) allows the server to relay incoming requests to another server. This might be used to delegate computationally expensive functions into a separate fork/server or to abstract a cluster of servers behind a common interface.

A public server listening on *:3000:

```javascript
// server_public.js
var jayson = require('jayson');

// create a server where "add" will relay a localhost-only server
var server = jayson.server({
  add: jayson.client.http({
    hostname: 'localhost',
    port: 3001
  })
});

// let the server listen to *:3000
server.http().listen(3000, '0.0.0.0');
```

A private server listening on localhost:3001:

```javascript
// server_private.js
var jayson = require('jayson');

var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

// let the private server listen to localhost:3001
server.http().listen(3001);
```

Every request to `add` on the public server will now relay the request to the private server.

#### Server events

In addition to specific events that certain interfaces emit, all servers will emit the following events:

* `request` Emitted when the server receives an interpretable request. First argument is the request object.
* `response` Emitted when the server is returning a response. First argument is the request object, the second is the response object.

#### Server methods

The Server class is accessible via `require('jayson').Server`.

##### Server([methods[, [options]]])

Constructor for a server. Will return an instance of `Server` even if not
invoked with `new`.

* `methods` (Object) Object of name and method pairs (name -> func)
* `options` (Object) Object of settings that will propagate to all interfaces

##### Server.prototype.method(name[, definition])

Adds a method to the server.

* `name` (String) Name of method
* `definition` (Function|JaysonClient) Function definition that can be either a regular JavaScript function that must take a callback as the last argument, or an instance of `jayson.Client` for relay functionality.

##### Server.prototype.hasMethod(name)

Checks if a method with `name` exists on the server. Returns a `Boolean`.

* `name` (String) Name of method

##### Server.prototype.removeMethod(name)

Removes a method from the server. Returns void.

* `name` (String) Name of method

##### Server.prototype.error([code[, message[, data]]])

Returns a JSON-RPC error object. Can be used to generate a custom error inside a method or to intentionally return [one of the official JSON-RPC 2.0 errors][jsonrpc-spec#error_object]. The error returned by this method can be used as the first argument to a RPC method callback.

* `code` (Number) Optional integer code
* `message` (String) Optional string description
* `data` (Object) Optional object with additional data

##### Server.prototype.call(request[, callback])

Calls a method on the server instance. Normally not used directly but can be used to pass raw JSON-RPC requests.

* `request` (Object|Array) JSON-RPC 2.0 request object or an array of batch requests
* `callback` (Function) Optional function that will be called on request completion

### Revivers and Replacers

JSON is a great data format, but it lacks support for representing types other than those defined in the [JSON specification][jsonrpc-spec] Fortunately the JSON methods in JavaScript (`JSON.parse` and
`JSON.stringify`) provides options for custom serialization/deserialization
routines. Jayson allows you to pass your own routines as options to both clients
and servers.

Simple example transferring the state of an object between a client and a server:

Shared code between the server and the client:

```javascript
// shared.js
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
  if(v && v.$class === 'counter') {
    var obj = new Counter;
    for(var prop in v.$props) obj[prop] = v.$props[prop];
    return obj;
  }
  return value;
};
```

The server:

```javascript
// server.js
var jayson = require('jayson');
var shared = require('./shared');

// Set the reviver/replacer options
var options = {
  reviver: shared.reviver,
  replacer: shared.replacer
};

// create a server
var server = jayson.server({
  increment: function(counter, callback) {
    counter.increment();
    callback(null, instance);
  }
}, options);

// let the server listen to for http connections on localhost:3000
server.http().listen(3000);
```

And a client invoking "increment" on the above server:

```javascript
// client.js
var jayson = require('jayson');
var shared = require('./shared');

// create a client with the shared reviver and replacer
var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost',
  reviver: shared.reviver,
  replacer: shared.replacer
});

// the object
var instance = new shared.Counter(2);

// invoke "increment"
client.request('increment', [instance], function(err, error, response) {
  if(err) throw err;
  console.log(response instanceof shared.Counter); // true
  console.log(response.count); // 3!
});
```

Instead of using a replacer, it is possible to define a `toJSON` method for any JavaScript object. Unfortunately there is no corresponding method to define for reviving objects, so the _reviver_ always has to be set up manually.

### Forking

It is possible to create an automatic fork.

TODO Document forking.

### Contributing

Highlighting [issues](https://github.com/tedeh/jayson/issues) or submitting pull
requests on [Github](https://github.com/tedeh/jayson) is most welcome.
