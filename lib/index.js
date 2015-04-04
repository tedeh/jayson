/**
 * Namespace available as require('jayson')
 * @namespace Jayson
 */
var Jayson = module.exports;

/**
 * @static
 * @type Client
 */
Jayson.Client = Jayson.client = require(__dirname + '/client');

/**
 * @static
 * @type Server
 */
Jayson.Server = Jayson.server = require(__dirname + '/server');

/**
 * @static
 * @type Utils
 */
Jayson.Utils = Jayson.utils = require(__dirname + '/utils');

/**
 * @static
 * @type Method
 */
Jayson.Method = Jayson.method = require(__dirname + '/method');
