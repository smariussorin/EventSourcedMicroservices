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
		datatablesBootstrap: {
			deps: [
				'datatablesPagination'
			]
		},
		datatablesPagination: {
			deps: [
				'datatables',
			]
		},
		jqueryDateFormat: {
			deps: [
				'jquery',
			]
		},
	},
	paths: {
		jquery: 'scripts/jquery/dist/jquery',
		underscore: 'scripts/underscore/underscore',
		backbone: 'scripts/backbone/backbone',
		backboneCQRS: 'lib/backboneCQRS/backboneCQRS-0.4',
		text: 'scripts/requirejs-text/text',
		datatables: 'assets/js/vendor/datatables/js/jquery.dataTables.min',
		datatablesBootstrap: 'assets/js/vendor/datatables/extensions/dataTables.bootstrap',
		datatablesPagination: 'assets/js/vendor/datatables/extensions/Pagination/input',
		jqueryDateFormat: 'assets/js/vendor/date-format/jquery-dateFormat.min',
		io: 'socket.io/socket.io.js'
	}
});
