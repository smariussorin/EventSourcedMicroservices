/*global define*/
require([
    'jquery',
    'underscore',
    'backbone',
    'io',
    'models/order',
    'collections/order',
    'text!templates/order/partials/item.jade',
    'text!templates/order/partials/edit-item.jade',
    'backboneCQRS',
    'backboneCQRS-init',
    'datatablesBootstrap',
    'jqueryDateFormat'
], function ($, _, Backbone, io, Order, Orders, itemTemplate, editItemTemplate) {
    'use strict';
    // Create a few EventDenormalizers
    // -------------------------------

    // orderCreated event 
    var orderCreateHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: Order,
        collection: Orders,

        // bindings
        forModel: 'order',
        forEvent: 'orderCreated'
    });

    // orderChanged event
    var orderChangedHandler = new Backbone.CQRS.EventDenormalizer({
        forModel: 'order',
        forEvent: 'orderChanged'
    });

    // orderDeleted event 
    var orderDeletedHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'delete',

        // bindings
        forModel: 'order',
        forEvent: 'orderDeleted'
    });



    // Create Backbone Stuff
    // ---------------------

  
    // views
    var OrderView = Backbone.View.extend({

        el: '#orders-list',
        tagName: 'tr',

        itemTemplate: _.template(itemTemplate),
        editItemTemplate: _.template(editItemTemplate),

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        events: {
            'click .editOrder' : 'uiEditOrder',
            'click .deleteOrder' : 'uiDeleteOrder',
            'click #changeOrder' : 'uiChangeOrder'
        },

        // render edit input
        uiEditOrder: function(e) {
            e.preventDefault();
            this.model.editMode = true;
            this.render();
        },

        // send deletePerson command with id
        uiDeleteOrder: function(e) {
            e.preventDefault();

            // CQRS command
            var cmd = new Backbone.CQRS.Command({
                id:_.uniqueId('msg'),
                command: 'deleteOrder',
                payload: { 
                    id: this.model.id
                },
                meta: "smarius.sorin@yahoo.com"
            });

            // emit it
            cmd.emit();
        },

        // send changeOrder command with new name
        uiChangeOrder: function(e) {
            e.preventDefault();

            var orderText = this.$('#newText').val();
            var orderUserId = this.$('#newUserId').val();

            this.$('#newText').val('');
            this.$('#newUserId').val('');

            this.model.editMode = false;
            this.render();

            //validation
            if (orderText) {

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id:_.uniqueId('msg'),
                    command: 'changeOrder',
                    payload: { 
                        id: this.model.id,
                        text: orderText,
                        userId : orderUserId
                    },
                    meta: "smarius.sorin@yahoo.com"
                });

                // emit it
                cmd.emit();
            }
        },

        render: function() {

                //initialize datatable
            $('#orders-list').DataTable({
                "dom": '<"row"<"col-md-8 col-sm-12"<"inline-controls"l>><"col-md-4 col-sm-12"<"pull-right"f>>>t<"row"<"col-md-4 col-sm-12"<"inline-controls"l>><"col-md-4 col-sm-12"<"inline-controls text-center"i>><"col-md-4 col-sm-12"p>>',
                "language": {
                "sLengthMenu": 'View _MENU_ records',
                "sInfo":  'Found _TOTAL_ records',
                "oPaginate": {
                    "sPage":    "Page ",
                    "sPageOf":  "of",
                    "sNext":  '<i class="fa fa-angle-right"></i>',
                    "sPrevious":  '<i class="fa fa-angle-left"></i>'
                }
                },
                "pagingType": "input",
                "data": App.orders,
                "order": [[ 1, "asc" ]],
                "columns": [
                {
                    "data": "null",
                    "defaultContent": '<label class="checkbox checkbox-custom-alt checkbox-custom-sm m-0"><input type="checkbox" class="selectMe"><i></i></label>'
                },
                { "data": "id" },
                {
                    "data": "date",
                    "className": "formatDate"
                },
                { "data": "placedby" },
                {
                    "type": "html",
                    "data": "status",
                    "render": function (data) {
                        if (data === 'sent') {
                            return '<span class="label bg-success">' + data + '</span>'
                        } else if (data === 'closed') {
                            return '<span class="label bg-warning">' + data + '</span>'
                        } else if (data === 'cancelled') {
                            return '<span class="label bg-lightred">' + data + '</span>'
                        } else if (data === 'pending') {
                            return '<span class="label bg-primary">' + data + '</span>'
                        }
                    }
                },
                { "data": "shipto" },
                { "data": "quantity" },
                {
                    "data": "total",
                    "type": "num-fmt",
                    "render": function (data) {
                        return '$' + parseFloat(data).toFixed(2);
                    }
                },
                {
                    "data": null,
                    "defaultContent": '<a href="shop-single-order" class="btn btn-xs btn-default mr-5"><i class="fa fa-search"></i> View</a><a class="btn btn-xs btn-lightred"><i class="fa fa-times deleteOrder"></i> Delete</a>'
                }
                ],
                "aoColumnDefs": [
                { 'bSortable': false, 'aTargets': [ "no-sort" ] }
                ],
                "drawCallback": function(settings, json) {
                    $(".formatDate").each(function (idx, elem) {
                        $(elem).text($.format.date($(elem).text(), "MMM d, yyyy"));
                    });
                    $('#select-all').change(function() {
                        if ($(this).is(":checked")) {
                            $('#orders-list tbody .selectMe').prop('checked', true);
                        } else {
                            $('#orders-list tbody .selectMe').prop('checked', false);
                        }
                    });
                }
            });

            //if (this.model.editMode) {
               // $(this.el).html(this.editItemTemplate(this.model.toJSON()));    
            //} else {
               // $(this.el).html(this.itemTemplate(this.model.toJSON()));  
            //}
            return this;
        }, 

        remove: function() {
            $(this.el).fadeOut('slow');
        }

    });

    var IndexView =  Backbone.View.extend({

        el: '#orders-list',

        initialize: function() {
            _.bindAll(this, 'addOrder');

            this.collection = App.orders;
            this.collection.bind('reset', this.render, this);
            this.collection.bind('add', this.addOrder, this);
        },

        events: {
            'click #addOrder' : 'uiAddOrder'
        },

        // send createPerson command
        uiAddOrder: function(e) {
            e.preventDefault();  

            var orderText = this.$('#newOrderText').val();
            var orderUserId = this.$('#newOrderUserId').val();

            if (orderText) {

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id:_.uniqueId('msg'),
                    command: 'createOrder',
                    payload: { 
                        text: orderText,
                        userId : orderUserId
                    },
                    meta: "smarius.sorin@yahoo.com"
                });

                // emit it
                cmd.emit();
            }

            this.$('#newOrderText').val('');
            this.$('#newOrderUserId').val('');
        },

        render: function() {
            this.collection.each(this.addOrder);
        },

        addOrder: function(order) {
            var view = new OrderView({model: order});
            this.$('#orders-list').append(view.render().el);
        }

    });

    // Bootstrap Backbone
    // ------------------

    var App = {};
    var init = function() {
        App.orders = Orders;
        App.orders.fetch();

        var indexView = new IndexView();
        indexView.render();
    };

    // kick things off
    $(init);

    return App;
});
