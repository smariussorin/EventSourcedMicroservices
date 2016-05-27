 /*global define*/
define([
    'underscore',
    'backbone',
    'models/item',
    'backboneCQRS',
], function (_, Backbone, Item) {
    'use strict';

    var ItemsCollection = Backbone.Collection.extend({
        model: Item,
        url: '/allItems.json'
    });

    return new ItemsCollection;
});
