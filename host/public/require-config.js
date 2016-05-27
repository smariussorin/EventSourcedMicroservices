/*global require*/
'use strict';

// Require.js allows us to configure shortcut alias
require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		backboneCQRS: {
			deps: [
				'backbone'
			]
		},
		io: {
			exports: 'io'
		},
	},
	paths: {
		jquery: 'scripts/jquery/dist/jquery',
		underscore: 'scripts/underscore/underscore',
		backbone: 'scripts/backbone/backbone',
		backboneCQRS: 'js/lib/backboneCQRS/backboneCQRS-0.4',
		text: 'scripts/requirejs-text/text',
		io: 'http://localhost:3000/socket.io/socket.io.js'
	}
});