var Jayson = require('../..');

/**
 * Namespace available as require('jayson/promise')
 * @namespace JaysonPromise
 */
var JaysonPromise = module.exports;

/**
 * @static
 * @type PromiseClient
 */
JaysonPromise.Client = JaysonPromise.client = require(__dirname + '/client');

/**
 * @static
 * @type PromiseServer
 */
JaysonPromise.Server = JaysonPromise.server = require(__dirname + '/server');

/**
 * @static
 * @type PromiseUtils
 */
JaysonPromise.Utils = JaysonPromise.utils = Jayson.utils;

/**
 * @static
 * @type PromiseMethod
 */
JaysonPromise.Method = JaysonPromise.method = require(__dirname + '/method');
