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

    it('should return an empty array when passed a parameter-less function', function() {
      var func = function() { return true; };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
    });

    it('should return the correct names when passed a single-parameter function', function() {
      var func = function(a) { return a; };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.containDeep(['a']);
    });

    it('should return the correct names when passed a simple function', function() {
      var func = function(a, b) { return a + b; };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.containDeep(['a', 'b']);
    });

    it('should return the correct names when passed a odd-formatted function', function() {
      var func = function     (a, b            , __b) {
        func(2, 3, 55, 4);
        return a + b;
      };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.containDeep(['a', 'b', '__b']);
    });

    it('should return the correct names when passed multi-line arguments', function() {
      var func = function (
        a,
        b , __b) {
        func(2, 3, 55, 4);
        return a + b;
      };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.containDeep(['a', 'b', '__b']);
    });

    it('should return the correct names when passed a function with complex parameters', function() {
      var func = function(_$foo, $$, FOO, $F00, _) { return false; };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.containDeep(['_$foo', '$$', 'FOO', '$F00', '_']);
    });

    it('should return the correct names in the right order', function() {
      var func = function(b, c, a) { return false; };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.containDeep(['b', 'c', 'a']);
      result[0].should.equal('b');
      result[1].should.equal('c');
      result[2].should.equal('a');
    });

    it('should return the correct parameters when passed a simple named function', function() {
      var func = function named(b, c, a) {};
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array).and.have.length(func.length);
      result.should.containDeep(['b', 'c', 'a']);
    });

    it('should return the correct parameters when passed a complex named function', function() {
      var func = function named_complex$(b, c, a) {};
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array).and.have.length(func.length);
      result.should.containDeep(['b', 'c', 'a']);
    });

    it('should return the correct paremters when passed an ES6 style function with zero parameters', function() {
      var func = () => {};
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array).and.have.length(0);
    });

    it('should return the correct paremters when passed an ES6 style function with more than zero parameters', function() {
      var func = (b, c, a) => {};
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array).and.have.length(func.length);
      result.should.containDeep(['b', 'c', 'a']);
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
