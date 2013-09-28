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
'use strict';

var expect = require('chai').expect;
var Hapi = require('hapi');

var hapiPlugin = require('../lib');

var next = function() {
	console.log('next');
};

var Plugin = function() {

	this.select = function() {
		return this;
	};

	this.route = function(route) {
		this._route = route;
	};
};

describe('LoggingService Proxy Hapi Plugin', function() {

	it('can register the plugin if the options pass validation', function() {
		var options = {
			proxy : {
				host : 'localhost',
				port : 8000
			},
			logLevel : 'DEBUG'
		};

		var plugin = new Plugin();
		hapiPlugin.register(plugin, options, next);
		console.log(plugin._route);
	});

	it('validates that if a mapUri option is specified then it checks that is a function', function(done) {
		var options = {
			proxy : {
				mapUri : function() {
					return 'http://localhost:8080/api/logging-service/log';
				}
			},
			logLevel : 'DEBUG'
		};

		var plugin = new Plugin();
		hapiPlugin.register(plugin, options, next);
		console.log(plugin._route);

		var optionsInvalid = {
			proxy : {
				mapUri : 123
			},
			logLevel : 'DEBUG'
		};

		try {
			hapiPlugin.register(new Plugin(), optionsInvalid, next);
			done(new Error('expected options to be invalid because mapUri is not a function'));
		} catch (error) {
			done();
		}

	});

	it('validates that if a postResponse option is specified then it checks that is a function', function(done) {
		var options = {
			proxy : {
				host : 'localhost',
				port : 8000,
				postResponse : function() {
					console.log('postResponse');
				}
			},
			logLevel : 'DEBUG',
			serverLabels : 'api'
		};

		var plugin = new Plugin();
		hapiPlugin.register(plugin, options, next);
		console.log(plugin._route);

		var optionsInvalid = {
			proxy : {
				host : 'localhost',
				port : 8000,
				postResponse : 123
			},
			logLevel : 'DEBUG'
		};

		try {
			hapiPlugin.register(new Plugin(), optionsInvalid, next);
			done(new Error('expected options to be invalid because postResponse is not a function'));
		} catch (error) {
			done();
		}

	});
});