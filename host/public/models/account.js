 


 /*global define*/
define([
	'underscore',
	'backbone',
	'backboneCQRS'
], function (_, Backbone) {
	'use strict';

    var Account = Backbone.Model.extend({
        modelName: 'account', // so denormalizers can resolve events to model
        
        initialize: function() {
            // bind this model to get event updates - a lot of magic ;)
            // not more to do the model gets updated now
            this.bindCQRS(); 
        }
    });

	return Account;
});
