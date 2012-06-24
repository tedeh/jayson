/**
 * @namespace Jayson namespace available as require('jayson')
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
