 /*global define*/
define([
    'underscore',
    'backbone',
    'models/order',
    'backboneCQRS',
], function (_, Backbone, Order) {
    'use strict';

    var OrdersCollection = Backbone.Collection.extend({
        model: Order,
        url: '/allOrders.json'
    });

    return new OrdersCollection;
});
