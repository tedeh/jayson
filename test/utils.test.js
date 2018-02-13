var should = require('should');
var PassStream = require('pass-stream');
var jayson = require('./..');
var utils = jayson.utils;

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
      var request = utils.request('a_method', null);
      request.should.have.property('method', 'a_method');
      request.should.not.have.property('params');
    });

  });

  describe('getParameterNames', function() {

    var specs = [
      {
        desc: 'no parameters',
        fn: function() { return true; },
        expected: [],
      },
      {
        desc: 'single-parameter fn',
        fn: function(a) {},
        expected: ['a'],
      },
      {
        desc: 'simple fn',
        fn: function(a, b) {},
        expected: ['a', 'b'],
      },
      {
        desc: 'odd-formatted function',
        fn: function     (a, b            , __b) {},
        expected: ['a', 'b', '__b'],
      },
      {
        desc: 'multi-line arguments',
        fn: function (
          a,
          b , __b) {},
        expected: ['a', 'b', '__b'],
      },
      {
        desc: 'complex parameters',
        fn: function(_$foo, $$, FOO, $F00, _) {},
        expected: ['_$foo', '$$', 'FOO', '$F00', '_'],
      },
      {
        desc: 'returning in right order',
        fn: function(b, c, a) {},
        expected: ['b', 'c', 'a'],
      },
      {
        desc: 'named function',
        fn: function named(b, c, a) {},
        expected: ['b', 'c', 'a'],
      },
      {
        desc: 'complex named function',
        fn: function named_complex$(b, c, a) {},
        expected: ['b', 'c', 'a'],
      },
      {
        desc: 'arrow function no parameters',
        fn: () => {},
        expected: [],
      },
      {
        desc: 'arrow function simple parameters',
        fn: (a, b, c) =>  {},
        expected: ['a', 'b', 'c'],
      },
      {
        desc: 'class function no params',
        fn: (function() {
          var obj = {a() {}};
          return obj.a;
        })(),
        expected: [],
      },
      {
        desc: 'class function',
        fn: (function() {
          var obj = {a(a, b, c) {}};
          return obj.a;
        })(),
        expected: ['a', 'b', 'c'],
      },
    ];

    specs.forEach(function(spec) {

      it('should handle ' + spec.desc, function() {
        var result = utils.getParameterNames(spec.fn);
        should.exist(result);
        result.should.eql(spec.expected);
      });

    });

  });

  describe('parseBody', function() {

    var parseBody = utils.parseBody;

    it('should parse a valid json object', function(done) {
      var stream = new PassStream();
      var obj = {asdf: true, complex: {value: 2, a: 3}};

      parseBody(stream, {}, function(err, result) {
        if(err) return done(err);
        obj.should.eql(result);
        done();
      });

      stream.end(JSON.stringify(obj));
    });

    it('should parse a valid json array', function(done) {
      var stream = new PassStream();
      var arr = [{first: true}, {asdf: true, complex: {value: 2, a: 3}}];

      parseBody(stream, {}, function(err, result) {
        if(err) return done(err);
        arr.should.eql(result);
        done();
      });

      stream.end(JSON.stringify(arr));
    });

    it('should return an error on bad input', function(done) {
      var stream = new PassStream();

      parseBody(stream, {}, function(err, result) {
        should(err).be.instanceof(Error);
        done();
      });

      stream.end("\"");
    });

  });

  describe('stringify', function(done) {

    it('should not throw with circular JSON reference', function(done) {

      var foo = {};
      var bar = { foo: foo };
      foo.bar = bar;

      var fn = utils.JSON.stringify(bar, {}, function(err, str) {
        should(err).not.exist;
        done();
      });

      should(fn).not.throw();
    });

  });

});
