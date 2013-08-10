# Jayson

Jayson is a [JSON-RPC 2.0][jsonrpc-spec] compliant server and client written in JavaScript for [node.js][node.js] that aims to be as simple as possible to use.

[jsonrpc-spec]: http://jsonrpc.org/spec.html 
[jsonrpc1-spec]: http://json-rpc.org/wiki/specification
[node.js]: http://nodejs.org/

## Features

* Servers that can listen to several interfaces at the same time
* Supports both HTTP and TCP client and server connections
* jQuery client
* Relaying of requests to other servers
* JSON reviving and replacing for transparent serialization of complex objects
* CLI client
* Fully tested to comply with the [official JSON-RPC 2.0 specification][jsonrpc-spec]
* Also supports [JSON-RPC 1.0][jsonrpc1-spec]

## Example

A basic JSON-RPC 2.0 server via HTTP:

Server in `examples/simple_example/server.js`:

```javascript
var jayson = require(__dirname + '/../..');

// create a server
var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

// Bind a http interface to the server and let it listen to localhost:3000
server.http().listen(3000);
```

Client in `examples/simple_example/client.js` invoking `add` on the above server:

```javascript
var jayson = require(__dirname + '/../..');

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

Install the latest version of _jayson_ from [npm](https://github.com/isaacs/npm) by executing `npm install jayson` in your shell. Do a global install with `npm install --global jayson` if you want the `jayson` client CLI in your PATH.

## Changelog

- *1.0.9*
  Add support for TCP servers and clients

### CLI client

There is a CLI client in `bin/jayson.js` and it should be available as `jayson` in your shell if you installed the package with the `--global` switch. Run `jayson --help` to see how it works.

## Requirements

Jayson does not have any special dependencies that cannot be resolved with a simple `npm install`. It has been tested with the following node.js versions:

- node.js v0.6.x
- node.js v0.8.x
- node.js v0.10.x

## Class documentation

In addition to this document, a comprehensive class documentation made with [jsdoc][jsdoc-spec] is available at [jayson.tedeh.net](http://jayson.tedeh.net).

[jsdoc-spec]: http://usejsdoc.org/

## Running tests

- Change directory to the repository root
- Install the testing framework
  ([mocha](https://github.com/visionmedia/mocha) together with
  [should](https://github.com/visionmedia/should.js)) by executing `npm install
  --dev`
- Run the tests with `make test` or `npm test`

## Usage

### Client

The client is available as the `Client` or `client` property of `require('jayson')`.

#### Interfaces

* `Client` Base class for interfacing with a server.
* `Client.tcp` TCP interface
* `Client.http` HTTP interface.
* `Client.https` HTTPS interface.
* `Client.fork` Node.js child_process/fork interface.
* `Client.jquery` Wrapper around `jQuery.ajax`.

#### Notifications

Notification requests are for cases where the reply from the server is not important and should be ignored. This is accomplished by setting the `id` property of a request object to `null`.

Client in `examples/notifications/client.js` doing a notification request:

```javascript
var jayson = require(__dirname + '/../..');

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
A server in `examples/notifications/server.js`:

```javascript
var jayson = require(__dirname + '/../..');

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
* Omitting the third argument `null` to `Client.prototype.request` does not generate a notification request. This argument has to be set explicitly to `null` for this to happen.
* Network errors and the like will still reach the callback. When the callback is invoked (with or without error) one can be certain that the server has received the request.
* See the [Official JSON-RPC 2.0 Specification][jsonrpc-spec] for additional information on how Jayson handles notifications that are erroneous.

#### Batches

A batch request is an array of individual requests that are sent to the server as one. Doing a batch request is very simple in Jayson and consists of constructing an `Array` of individual requests (created by not passing a callback to `Client.prototype.request`) that is then itself passed to `Client.prototype.request`. 

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

// callback takes two arguments (first type of callback)
client.request(batch, function(err, responses) {
  if(err) throw err;
  // responses is an array of errors and successes together
  console.log('responses', responses);
});

// callback takes three arguments (second type of callback)
client.request(batch, function(err, errors, successes) {
  if(err) throw err;
  // errors is an array of the requests that errored
  console.log('errors', errors);
  // successes is an array of requests that succeded
  console.log('successes', successes);
});
```

Server example in `examples/batch_request/server.js`:

```javascript
var jayson = require(__dirname + '/../..');

var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

server.http().listen(3000);
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

* `request` Emitted when a client is just about to dispatch a request. First argument is the request object.
* `response` Emitted when a client has just received a reponse. First argument is the request object, second argument is the response as received.

#### Client interfaces and options

Every client supports these options:

* `reviver` -> Function to use as a JSON reviver
* `replacer` -> Function to use as a JSON replacer
* `generator` -> Function to generate request ids with. If omitted, Jayson will just generate a "random" number that is [RFC4122] compliant and looks like this: `3d4be346-b5bb-4e28-bc4a-0b721d4f9ef9`
* `version` -> Can be either `1` or `2` depending on which specification should be followed in communicating with the server. Defaults to `2` for [JSON-RPC 2.0][jsonrpc-spec]

[rfc_4122_spec]: http://www.ietf.org/rfc/rfc4122.txt

##### Client.http

Uses the same options as [http.request][nodejs_docs_http_request] in addition to these options:

* `encoding` -> String that determines the encoding to use and defaults to utf8

It is possible to pass a string URL as the first argument. The URL will be run through [url.parse][nodejs_docs_url_parse]. Example:

```javascript
var jayson = require(__dirname + '/../..');
var client = jayson.client.http('http://localhost:3000');
// client.options is now the result of url.parse
```

[nodejs_docs_http_request]: http://nodejs.org/docs/latest/api/http.html#http_http_request_options_callback
[nodejs_docs_url_parse]: http://nodejs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost

##### Client.https

Uses the same options as [https.request][nodejs_docs_https_request] in addition _to the same options as `Client.http`_. This means it is also possible
to pass a string URL as the first argument and have it interpreted by [url.parse][nodejs_docs_url_parse].

[nodejs_docs_https_request]: http://nodejs.org/api/all.html#all_https_request_options_callback

##### Client.tcp

Uses the same options as the base class.

##### Client.fork

Uses the same options as the base class.

##### Client.jquery

The jQuery Client is stand-alone from the other classes and should preferably be compiled with `make compile` which outputs different flavors into the `build` directory. Supports inclusion via AMD. Uses the same options as [jQuery.ajax][jquery_docs_ajax] and exposes itself as $.jayson with the same arguments as `Client.prototype.request`.

[jquery_docs_ajax]: http://api.jquery.com/jQuery.ajax/

### Server

The server classes are available as the `Server` or `server` property of `require('jayson')`.

The server also sports several interfaces that can be accessed as properties of an instance of `Server`.

#### Server interfaces and options

* `Server` - Base interface for a server that supports receiving JSON-RPC 2.0 requests.
* `Server.tcp` - TCP server that inherits from [net.Server][nodejs_doc_net_server].
* `Server.http` - HTTP server that inherits from [http.Server][nodejs_doc_http_server].
* `Server.https` - HTTPS server that inherits from [https.Server][nodejs_doc_https_server].
* `Server.middleware` - Method that returns a [Connect][connect]/[Express][express] compatible middleware function.
* `Server.fork` Creates a child process that can take requests via `client.fork`

[nodejs_doc_net_server]: http://nodejs.org/docs/latest/api/net.html#net_class_net_server
[nodejs_doc_http_server]: http://nodejs.org/docs/latest/api/http.html#http_class_http_server
[nodejs_doc_https_server]: http://nodejs.org/docs/latest/api/https.html#https_class_https_server
[connect]: http://www.senchalabs.org/connect/
[express]: http://expressjs.com/

Every server supports these options:

* `reviver` -> Function to use as a JSON reviver
* `replacer` -> Function to use as a JSON replacer
* `version` -> Can be either `1` or `2` depending on which specification clients are expected to follow. Defaults to `2` for [JSON-RPC 2.0][jsonrpc-spec]

#### Using many server interfaces at the same time

A Jayson server can use many interfaces at the same time.

Server in `examples/many_interfaces/server.js` that listens to both `http` and a `https` requests:

```javascript
var jayson = require(__dirname + '/../..');

var server = jayson.server({
  add: function(a, b, callback) {
    return callback(null, a + b);
  }
});

// "http" will be an instance of require('http').Server
var http = server.http();

// "https" will be an instance of require('https').Server
var https = server.https({
  //cert: require('fs').readFileSync('cert.pem'),
  //key require('fs').readFileSync('key.pem')
});

http.listen(80, function() {
  console.log('Listening on *:80')
});

https.listen(443, function() {
  console.log('Listening on *:443')
});
```

#### Using the server as a relay

Passing an instance of a client as a method to the server makes the server relay incoming requests to wherever the client is pointing to. This might be used to delegate computationally expensive functions into a separate fork/server or to abstract a cluster of servers behind a common interface.

Public server in `examples/relay/server_public.js` listening on `*:3000`:

```javascript
var jayson = require(__dirname + '/../..');

// create a server where "add" will relay a localhost-only server
var server = jayson.server({
  add: jayson.client.http({
    hostname: 'localhost',
    port: 3001
  })
});

// let the server listen to *:3000
server.http().listen(3000, function() {
  console.log('Listening on *:3000');
});
```

Private server in `examples/relay/server_private.js` listening on localhost:3001:

```javascript
var jayson = require(__dirname + '/../..');

var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

// let the private server listen to localhost:3001
server.http().listen(3001, '127.0.0.1', function() {
  console.log('Listening on 127.0.0.1:3001');
});
```

Every request to `add` on the public server will now relay the request to the private server. See the client example in `examples/relay/client.js`.

#### Server events

In addition to events that are specific to certain interfaces, all servers will emit the following events:

* `request` Emitted when the server receives an interpretable (non-batch) request. First argument is the request object.
* `response` Emitted when the server is returning a response. First argument is the request object, the second is the response object.
* `batch` Emitted when the server receives a batch request. First argument is an array of requests. Will emit `request` for each interpretable request in the batch.

#### Errors

If you should like to return an error from an method request to indicate a failure, remember that the [JSON-RPC 2.0][jsonrpc-spec] specification requires the error to be an `Object` with a `code (Integer/Number)` to be regarded as valid. You can also provide a `message (String)` and a `data (Object)` with additional information. Example: 

```javascript
var jayson = require(__dirname + '/../..');

var server = jayson.server({
  i_cant_find_anything: function(id, callback) {
    var error = {code: 404, message: 'Cannot find ' + id};
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
var jayson = require(__dirname + '/../..');

var server = jayson.server({
  invalid_params: function(id, callback) {
    var error = this.error(-32602); // returns an error with the default properties set
    callback(error);
  }
});
```

You can even override the default messages:

```javascript
var jayson = require(__dirname + '/../..');

var server = jayson.server({
  error_giver_of_doom: function(callback) {
    callback(true) // invalid error format, which causes an Internal Error to be returned instead
  }
});

// Override the default message
server.errorMessages[Server.errors.INTERNAL_ERROR] = 'I has a sad. I cant do anything right';
```

### Revivers and Replacers

JSON lacks support for representing types other than the simple ones defined in the [JSON specification][jsonrpc-spec]. Fortunately the JSON methods in JavaScript (`JSON.parse` and `JSON.stringify`) provide options for custom serialization/deserialization routines. Jayson allows you to pass your own routines as options to both clients and servers.

Simple example transferring the state of an object between a client and a server:

Shared code between the server and the client in `examples/reviving_and_replacing/shared.js`:

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
    var obj = new Counter;
    for(var prop in value.$props) obj[prop] = value.$props[prop];
    return obj;
  }
  return value;
};
```

Server in `examples/reviving_and_replacing/server.js`:

```javascript
var jayson = require(__dirname + '/../..');
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
    callback(null, counter);
  }
}, options);

// let the server listen to for http connections on localhost:3000
server.http().listen(3000);
```

A client in `examples/reviving_and_replacing/client.js` invoking "increment" on the server:

```javascript
var jayson = require(__dirname + '/../..');
var shared = require('./shared');

// create a client with the shared reviver and replacer
var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost',
  reviver: shared.reviver,
  replacer: shared.replacer
});

// create the object
var instance = new shared.Counter(2);

// invoke "increment"
client.request('increment', [instance], function(err, error, result) {
  if(err) throw err;
  console.log(result instanceof shared.Counter); // true
  console.log(result.count); // 3!
  console.log(instance === result); // false - it won't be the same object, naturally
});
```

##### Notes

* Instead of using a replacer, it is possible to define a `toJSON` method for any JavaScript object. Unfortunately there is no corresponding method for reviving objects (that would not work, obviously), so the _reviver_ always has to be set up manually.

### Forking

It is possible (and _simple_) to create automatic forks with jayson using the node.js `child_process` core library. This might be used for expensive or blocking calculations and to provide some separation from the main server thread.

The forking server class is available as `jayson.Server.Fork` and takes a file as the first option. This file will be require'd by jayson and should export any methods that are to be made available to clients.

The main server in `examples/forking/server.js`

```javascript
var jayson = require(__dirname + '/../..');

// creates a fork
var fork = jayson.server.fork(__dirname + '/fork');

var front = jayson.server({
  fib: jayson.client.fork(fork) // connects "fib" to the fork
});

// let the front server listen to localhost:3000
front.http().listen(3000);
```

The forked server in `examples/forking/fork.js`

```javascript
// export "fib" for forking
exports.fib = function(n, callback) {
  function fib(n) {
    if(n < 2) return n;
    return fib(n - 1) + fib(n - 2);
  };
  var result = fib(n);
  callback(null, fib(n));
};
```

A client doing a fibonacci request in `examples/forking/client.js`

```javascript
var jayson = require(__dirname + '/../..');

var client = jayson.client.http({
  port: 3000,
  hostname: 'localhost'
});

// request "fib" on the server
client.request('fib', [15], function(err, response) {
  console.log(response);
});
```

#### Notes

* A child_process is spawned immediately 
* To specify options (such as a reviver and a replacer) for the forked server, `module.exports` an instance of `jayson.Server` instead of exporting plain methods.

### Contributing

Highlighting [issues](https://github.com/tedeh/jayson/issues) or submitting pull
requests on [Github](https://github.com/tedeh/jayson) is most welcome.
