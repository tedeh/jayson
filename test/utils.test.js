var assert = require('assert');
var should = require('should');

var jayson = require(__dirname + '/..');
var utils = jayson.utils;

describe('utils', function() {

  describe('request()', function() {

    it('exists', function() {
      utils.should.have.property('request');
      utils.request.should.be.a('function');
    });

    it('should throw a TypeError on an invalid method argument', function() {
      (function() {
        utils.request(null, [1, 2,], null);
      }).should.throw(TypeError);
    });

    it('should throw a TypeError on an invalid params argument', function() {
      (function() {
        utils.request('a_method', null);
      }).should.throw(TypeError);
    });

  });

  describe('getParameterNames()', function() {

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
      result.should.include('a');
    });

    it('should return the correct names when passed a simple function', function() {
      var func = function(a, b) { return a + b; };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.include('a', 'b');
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
      result.should.include('a', 'b', '__b');
    });

    it('should return the correct names when passed a function with complex parameters', function() {
      var func = function(_$foo, $$, FOO, $F00, _) { return false; };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.include('_$foo', '$$', 'FOO', '$F00', '_');
    });

    it('should return the correct names in the right order', function() {
      var func = function(b, c, a) { return false; };
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array);
      result.should.have.length(func.length);
      result.should.include('b', 'c', 'a');
      result[0].should.equal('b');
      result[1].should.equal('c');
      result[2].should.equal('a');
    });

    it('should return the correct parameters when passed a simple named function', function() {
      var func = function named(b, c, a) {};
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array).and.have.length(func.length);
      result.should.include('b', 'c', 'a');
    });

    it('should return the correct parameters when passed a complex named function', function() {
      var func = function named_complex$(b, c, a) {};
      var result = utils.getParameterNames(func);
      should.exist(result);
      result.should.be.instanceof(Array).and.have.length(func.length);
      result.should.include('b', 'c', 'a');
    });

  });

});
