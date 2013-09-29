/**
 * Copyright [2013] [runrightfast.co]
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @param options -
 *            config object that contains the following properties:
 * 
 * <code>
 *	{ proxy : {												// OPTIONAL - see http://spumko.github.io/resource/api/#server-route-options-
 *		// default values that differ from Hapi defaults
 *		xforward : true,								 
 *		passThrough : true,
 *		protocol : 'http'
 *    },
 *    path : '/api/runrightfast-logging-service/log'		// OPTIONAL - (optional) the absolute path used to match incoming
 *            												//	requests (must begin with '/'). Incoming requests are compared to
 *            												// 	the configured paths based on the server router configuration
 *            												//	option. The path can include named parameters enclosed in {} which
 *            												//	will be matched against literal values in the request as described
 *            												//	in Path parameters. 
 *            												//	Default is '/api/runrightfast-logging-service/log'
 *  }  
 * </code>
 */
module.exports.register = function(plugin, options, next) {
	'use strict';

	var lodash = require('lodash');
	var Hoek = require('hoek');
	var assert = Hoek.assert;
	var extend = require('extend');

	var logging = require('runrightfast-commons').logging;
	var pkgInfo = require('./pkgInfo');
	var logger = logging.getLogger(pkgInfo.name);

	var config = {
		proxy : {
			xforward : true,
			passThrough : true,
			protocol : 'http'
		},
		path : '/api/runrightfast-logging-service/log',
		logLevel : 'WARN'
	};

	var validateConfig = function(config) {
		assert(lodash.isString(config.path), 'config.path is required and must be a String');
		assert(config.path.charAt(0) === '/', "config.path must start with a '/'");

		var proxy = config.proxy;
		if (proxy.host) {
			assert(lodash.isString(proxy.host), 'proxy.host must be a String');
			assert(lodash.isNumber(proxy.port), 'proxy.port must be a Number');
			assert(proxy.protocol === 'http' || proxy.protocol === 'https', 'proxy.protocol must be either http or https');
			assert(lodash.isUndefined(proxy.mapUri), 'proxy.mapUri is mutually exclusive with proxy.host, proxy.port, proxy.protocol');
		} else {
			assert(!lodash.isUndefined(proxy.mapUri), 'proxy.mapUri is required if proxy.host, proxy.port, proxy.protocol are not defined');
			assert(lodash.isFunction(proxy.mapUri), 'proxy.mapUri must be a Function');
		}

		if (!lodash.isUndefined(proxy.postResponse)) {
			assert(lodash.isFunction(proxy.postResponse), 'proxy.postResponse must be a Function');
		}

	};

	/**
	 * Used to select servers to configure based on server labels. By default,
	 * it returns back the plugin
	 */
	var selection = function(config) {
		if (lodash.isArray(config.serverLabels) || lodash.isString(config.serverLabels)) {
			return plugin.select(config.serverLabels);
		}
		return plugin;
	};

	var registerPlugin = function() {
		selection(config).route({
			method : 'POST',
			path : config.path,
			config : {
				handler : config,
				description : 'logs an event object or an array of events',
				tags : [ 'log', 'event' ]
			}
		});
	};

	extend(true, config, options);
	logging.setLogLevel(logger, config.logLevel);
	if (logger.isDebugEnabled()) {
		logger.debug(config);
	}
	validateConfig(config);
	registerPlugin();

	next();

};