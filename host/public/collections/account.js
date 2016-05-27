 /*global define*/
define([
	'underscore',
	'backbone',
    'models/account',
    'backboneCQRS',
], function (_, Backbone, Account) {
	'use strict';

    var AccountsCollection = Backbone.Collection.extend({
        model: Account,
        url: '/allAccounts.json'
    });

	return new AccountsCollection;
});
