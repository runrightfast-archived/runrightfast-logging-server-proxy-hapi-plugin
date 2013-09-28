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

describe('LoggingService Proxy Hapi Plugin', function() {

	it('can be added as a plugin to hapi', function(done) {

		var options = {
			proxy : {
				host : 'localhost',
				port : 8000
			},
			logLevel : 'DEBUG'
		};

		var server = new Hapi.Server();
		server.pack.require('../', options, function(err) {
			expect(err).to.not.exist;
			done();
		});
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

		var server = new Hapi.Server();
		server.pack.require('../', options, function(err) {
			expect(err).to.not.exist;
			done();
		});

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

		var server = new Hapi.Server();
		server.pack.require('../', options, function(err) {
			expect(err).to.not.exist;
			done();
		});
	});

	it('if a postResponse option is not a function, then it will fail to be added as a Hapi plugin', function(done) {
		var options = {
			proxy : {
				host : 'localhost',
				port : 8000,
				postResponse : 'INVALID OPTION'
			},
			logLevel : 'DEBUG'
		};

		var server = new Hapi.Server();

		try {
			server.pack.require('../', options, function(err) {
				expect(err).to.exist;
				done();
			});
			done(new Error('expected an Error because proxy.postResponse is not a Function'));
		} catch (err) {
			done();
		}

	});
});