/*global define*/
require([
    'jquery',
    'underscore',
    'backbone',
    'models/item',
    'collections/item',
    'text!templates/item/item.jade',
    'text!templates/item/edit-item.jade',
    'backboneCQRS',
], function ($, _, Backbone, Item, Items, itemTemplate, editItemTemplate) {
    'use strict';
       // Init Backbone.CQRS
    // ------------------

    // we just have to override eventNameAttr:
    Backbone.CQRS.hub.init({ eventNameAttr: 'event' });

    // override Backbone.sync with CQRS.sync which allows only GET method
    Backbone.sync = Backbone.CQRS.sync;


    // Wire up communication to/from server
    // ------------------------------------

    // create a socket.io connection
    var socket = io.connect('http://localhost:3000');
    
    // on receiving an event from the server via socket.io 
    // forward it to backbone.CQRS.hub
    socket.on('events', function(evt) {
        Backbone.CQRS.hub.emit('events', evt);
    });

    // forward commands to server via socket.io
    Backbone.CQRS.hub.on('commands', function(cmd) {
        socket.emit('commands', cmd);
    });



    // Create a few EventDenormalizers
    // -------------------------------

    // itemCreated event 
    var itemCreateHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: Item,
        collection: Items,

        // bindings
        forModel: 'item',
        forEvent: 'itemCreated'
    });

    // itemChanged event
    var itemChangedHandler = new Backbone.CQRS.EventDenormalizer({
        forModel: 'item',
        forEvent: 'itemChanged'
    });

    // itemDeleted event 
    var itemDeletedHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'delete',

        // bindings
        forModel: 'item',
        forEvent: 'itemDeleted'
    });



    // Create Backbone Stuff
    // ---------------------

  
    // views
    var ItemView = Backbone.View.extend({
        
        tagName: 'li',
        className: 'item',

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        events: {
            'click .editItem' : 'uiEditItem',
            'click .deleteItem' : 'uiDeleteItem',
            'click #changeItem' : 'uiChangeItem'
        },

        // render edit input
        uiEditItem: function(e) {
            e.preventDefault();
            this.model.editMode = true;
            this.render();
        },

        // send deletePerson command with id
        uiDeleteItem: function(e) {
            e.preventDefault();

            // CQRS command
            var cmd = new Backbone.CQRS.Command({
                id:_.uniqueId('msg'),
                command: 'deleteItem',
                payload: { 
                    id: this.model.id
                },
                meta: "smarius.sorin@yahoo.com"
            });

            // emit it
            cmd.emit();
        },

        // send changeItem command with new name
        uiChangeItem: function(e) {
            e.preventDefault();

            var itemText = this.$('#newText').val();
            var itemUserId = this.$('#newUserId').val();

            this.$('#newText').val('');
            this.$('#newUserId').val('');

            this.model.editMode = false;
            this.render();

            //validation
            if (itemText) {

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id:_.uniqueId('msg'),
                    command: 'changeItem',
                    payload: { 
                        id: this.model.id,
                        text: itemText,
                        userId : itemUserId
                    },
                    meta: "smarius.sorin@yahoo.com"
                });

                // emit it
                cmd.emit();
            }
        },

        render: function() {
            if (this.model.editMode) {
                template = _.template(editItemTemplate, this.model.toJSON());
                $(this.el).html(template);  
            } else {
                template = _.template(itemTemplate, this.model.toJSON());
                $(this.el).html(template);  
            }
            return this;
        }, 

        remove: function() {
            $(this.el).fadeOut('slow');
        }

    });

    var IndexView =  Backbone.View.extend({

        el: '#index-view',

        initialize: function() {
            _.bindAll(this, 'addItem');

            this.collection = app.items;
            this.collection.bind('reset', this.render, this);
            this.collection.bind('add', this.addItem, this);
        },

        events: {
            'click #addItem' : 'uiAddItem'
        },

        // send createPerson command
        uiAddItem: function(e) {
            e.preventDefault();  

            var itemText = this.$('#newItemText').val();
            var itemUserId = this.$('#newItemUserId').val();

            if (itemText) {

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id:_.uniqueId('msg'),
                    command: 'createItem',
                    payload: { 
                        text: itemText,
                        userId : itemUserId
                    },
                    meta: "smarius.sorin@yahoo.com"
                });

                // emit it
                cmd.emit();
            }

            this.$('#newItemText').val('');
            this.$('#newItemUserId').val('');
        },

        render: function() {
            this.collection.each(this.addItem);
        },

        addItem: function(item) {
            var view = new ItemView({model: item});
            this.$('#items').append(view.render().el);
        }

    });


    // Bootstrap Backbone
    // ------------------

    var app = {};
    var init = function() {
        app.items = items;
        app.items.fetch();

        var indexView = new IndexView();
        indexView.render();
    };

    // kick things off
    $(init);
});