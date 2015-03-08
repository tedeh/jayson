/**
 * Namespace available as require('jayson')
 * @namespace Jayson
 */
var Jayson = module.exports;

/**
 * @static
 * @type Client
 */
Jayson.Client = Jayson.client = require('./client');

/**
 * @static
 * @type Server
 */
Jayson.Server = Jayson.server = require('./server');

/**
 * @static
 * @type Utils
 */
Jayson.Utils = Jayson.utils = require('./utils');
