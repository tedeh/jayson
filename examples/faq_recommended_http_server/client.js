var jayson = require('./../..');
var request = require('superagent');

// generate a json-rpc version 2 compatible request (non-notification)
var requestBody = jayson.Utils.request('add', [1,2,3,4], undefined, {
  version: 2,
  // generator: [...] <- function to generate the request id
});

request.post('http://localhost:3001')
  // <- here we can setup timeouts, set headers, cookies, etc
  //.timeout({response: 5000, deadline: 60000})
  .send(requestBody)
  .end(function(err, response) {
    if(err) {
      // superagent considers 300-499 status codes to be errors
      // @see http://visionmedia.github.io/superagent/#error-handling
      if(!err.status) throw err;
      const body = err.response.body;
      // body may be a JSON-RPC error, or something completely different
      // it can be handled here
      if(body && body.error && jayson.Utils.Response.isValidError(body.error, 2)) {
        // the error body was a valid JSON-RPC version 2
        // we may wish to deal with it differently
        console.err(body.error);
        return;
      }
      throw err; // error was something completely different
    }

    const body = response.body;

    // we should check here if we ACTUALLY got a valid response
    var isValid = function() { return true; };
    if(!isValid(body)) {
      // if not, we have a different error
      console.err(body);
      return;
    }

    // do something useful with the result
    console.log(body.result); // 10
  });
