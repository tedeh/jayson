'use strict';

const should = require('should');
const PassStream = require('pass-stream');
const jayson = require('./..');
const utils = jayson.utils;

describe('jayson.utils', function() {

  describe('request', function() {

    it('exists', function() {
      utils.should.have.property('request');
      utils.request.should.be.a.Function;
    });

    it('should throw a TypeError on an invalid method argument', function() {
      (function() {
        utils.request(null, [1, 2,], null);
      }).should.throw(TypeError);
    });

    it('should throw a TypeError on an invalid params argument', function() {
      (function() {
        utils.request('a_method', true);
      }).should.throw(TypeError);
    });

    it('should omit the params argument when not given', function() {
      const request = utils.request('a_method', null);
      request.should.have.property('method', 'a_method');
      request.should.not.have.property('params');
    });

  });

  describe('parseBody', function() {

    const parseBody = utils.parseBody;

    it('should parse a valid json object', function(done) {
      const stream = new PassStream();
      const obj = {asdf: true, complex: {value: 2, a: 3}};

      parseBody(stream, {}, function(err, result) {
        if(err) return done(err);
        obj.should.eql(result);
        done();
      });

      stream.end(JSON.stringify(obj));
    });

    it('should parse a valid json array', function(done) {
      const stream = new PassStream();
      const arr = [{first: true}, {asdf: true, complex: {value: 2, a: 3}}];

      parseBody(stream, {}, function(err, result) {
        if(err) return done(err);
        arr.should.eql(result);
        done();
      });

      stream.end(JSON.stringify(arr));
    });

    it('should return an error on bad input', function(done) {
      const stream = new PassStream();

      parseBody(stream, {}, function(err, result) {
        should(err).be.instanceof(Error);
        done();
      });

      stream.end("\"");
    });

  });

  describe('JSON.stringify', function(done) {

    it('should not throw with circular JSON reference', function(done) {

      const foo = {};
      const bar = { foo: foo };
      foo.bar = bar;

      const fn = utils.JSON.stringify(bar, {}, function(err, str) {
        should(err).not.exist;
        done();
      });

      should(fn).not.throw();
    });

  });

  describe('Response.isValidResponse', function() {

    const specs = [
      {
        desc: 'a valid 2 response',
        response: {jsonrpc: '2.0', result: null, id: 'something'},
        version: 2,
        expected: true,
      },
      {
        desc: 'a valid 2 response',
        response: {jsonrpc: '2.0', result: null, id: null},
        version: 2,
        expected: true,
      },
      {
        desc: 'a valid 2 error response with data',
        response: {jsonrpc: '2.0', id: 'something', error: {code: 123, message: 'something', data: {}}},
        version: 2,
        expected: true,
      },
      {
        desc: 'a valid 2 error response without data',
        response: {jsonrpc: '2.0', id: 'something', error: {code: 123, message: 'something'}},
        version: 2,
        expected: true,
      },
      {
        desc: 'an invalid 2 response (both error and result properties)',
        response: {jsonrpc: '2.0', id: 'something', error: {code: 123, message: 'something'}, result: null},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 error response (no code)',
        response: {jsonrpc: '2.0', id: 'something', error: {message: 'something'}},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 error response (no message)',
        response: {jsonrpc: '2.0', id: 'something', error: {code: 123}},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 error response (code not number)',
        response: {jsonrpc: '2.0', id: 'something', error: {code: '123', message: 'asdf'}},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 error response (code not integer)',
        response: {jsonrpc: '2.0', id: 'something', error: {code: 123.3, message: 'asdf'}},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 response (invalid error and contains result property)',
        response: {jsonrpc: '2.0', id: 'something', error: {}, result: {}},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 response (no jsonrpc property)',
        response: {id: 'something', result: {}},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 response (jsonrpc property not equal to 2.0)',
        response: {jsonrpc: '3.0', id: 'something', result: {}},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 response (no id property)',
        response: {jsonrpc: '2.0', result: null},
        version: 2,
        expected: false,
      },
      {
        desc: 'an invalid 2 response (response not plain object)',
        response: null,
        version: 2,
        expected: false,
      },
      {
        desc: 'a valid 1 response',
        response: {id: 'something', result: {}, error: null},
        version: 1,
        expected: true,
      },
      {
        desc: 'a valid 1 error response',
        response: {id: 'something', result: null, error: {}},
        version: 1,
        expected: true,
      },
      {
        desc: 'an invalid 1 response (response not plain object)',
        response: null,
        version: 1,
        expected: false,
      },
      {
        desc: 'an invalid 1 response (non-null result and error)',
        response: {id: 'something', result: {}, error: {}},
        version: 1,
        expected: false,
      },
      {
        desc: 'an invalid 1 response (no result or error)',
        response: {id: 'something'},
        version: 1,
        expected: false,
      },
      {
        desc: 'an invalid 1 response (missing id)',
        response: {result: {}, error: null},
        version: 1,
        expected: false,
      },
      {
        desc: 'an invalid 1 response (missing error null)',
        response: {id: 'something', result: {}},
        version: 1,
        expected: false,
      },
      {
        desc: 'an invalid 1 response (missing result null)',
        response: {id: 'something', error: {}},
        version: 1,
        expected: false,
      },
    ];

    specs.forEach(function(spec) {

      it(`should handle ${spec.desc}`, function() {
        const result = utils.Response.isValidResponse(spec.response, spec.version);
        should(result).equal(spec.expected);
      });

    });
  
  });

});
