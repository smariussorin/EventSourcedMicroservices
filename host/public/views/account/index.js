/*global define*/
require([
    'jquery',
    'underscore',
    'backbone',
    'io',
    'models/account',
    'collections/account',
    'text!templates/account/partials/item.jade',
    'text!templates/account/partials/edit-item.jade',
    'backboneCQRS',
    'backboneCQRS-init',
], function ($, _, Backbone, io, Account, Accounts, itemTemplate, editItemTemplate) {
    'use strict';
    // Create a few EventDenormalizers
    // -------------------------------

    // accountCreated event 
    var accountCreateHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: Account,
        collection: Accounts,

        // bindings
        forModel: 'account',
        forEvent: 'accountCreated'
    });

    // accountChanged event
    var accountChangedHandler = new Backbone.CQRS.EventDenormalizer({
        forModel: 'account',
        forEvent: 'accountChanged'
    });

    // accountDeleted event 
    var accountDeletedHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'delete',

        // bindings
        forModel: 'account',
        forEvent: 'accountDeleted'
    });


    // Create Backbone Stuff
    // ---------------------

    // views
    var AccountView = Backbone.View.extend({
        
        tagName: 'li',
        className: 'account',

        itemTemplate: _.template(itemTemplate),
        editItemTemplate: _.template(editItemTemplate),

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        events: {
            'click .editAccount' : 'uiEditAccount',
            'click .deleteAccount' : 'uiDeleteAccount',
            'click #changeAccount' : 'uiChangeAccount'
        },

        // render edit input
        uiEditAccount: function(e) {
            e.preventDefault();
            this.model.editMode = true;
            this.render();
        },

        // send deletePerson command with id
        uiDeleteAccount: function(e) {
            e.preventDefault();

            var accountId = this.model.id;

            // CQRS command
            var cmd = new Backbone.CQRS.Command({
                id:_.uniqueId('msg'),
                command: 'deleteAccount',
                payload: { 
                    id: accountId
                },
                meta: "smarius.sorin@yahoo.com"
            });
            
            // emit it
            cmd.emit();
        },

        // send changeAccount command with new name
        uiChangeAccount: function(e) {
            e.preventDefault();

            var accountEmail = this.$('#newEmail').val();
            var accountName  = this.$('#newName').val();

            this.$('#newEmail').val('');
            this.$('#newName').val('');

            this.model.editMode = false;
            this.render();

            //validation
            if (accountName) {

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id:_.uniqueId('msg'),
                    command: 'changeAccount',
                    payload: { 
                        id: this.model.id,
                        name: accountName,
                        email : accountEmail
                    },
                    meta: "smarius.sorin@yahoo.com"
                });

                // emit it
                cmd.emit();
            }
        },

        render: function() {
            if (this.model.editMode) {
                $(this.el).html(this.editItemTemplate(this.model.toJSON()));    
            } else {
                $(this.el).html(this.itemTemplate(this.model.toJSON()));  
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
            _.bindAll(this, 'addAccount');

            this.collection = app.accounts;
            this.collection.bind('reset', this.render, this);
            this.collection.bind('add', this.addAccount, this);
        },

        events: {
            'click #addAccount' : 'uiAddAccount'
        },

        // send createPerson command
        uiAddAccount: function(e) {
            e.preventDefault();  

            var accountEmail = this.$('#newAccountEmail').val();
            var accountName = this.$('#newAccountName').val();

            if (accountName) {

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id:_.uniqueId('msg'),
                    command: 'createAccount',
                    payload: { 
                        name: accountName,
                        email : accountEmail
                    },
                    meta: "smarius.sorin@yahoo.com"
                });

                // emit it
                cmd.emit();
            }

            this.$('#newAccountName').val('');
            this.$('#newAccountEmail').val('');
        },

        render: function() {
            this.collection.each(this.addAccount);
        },

        addAccount: function(account) {
            var view = new AccountView({model: account});
            this.$('#accounts').append(view.render().el);
        }

    });


    // Bootstrap Backbone
    // ------------------

    var app = {};
    var init = function() {
        app.accounts = Accounts;
        app.accounts.fetch();

        var indexView = new IndexView();
        indexView.render();
    };

    // kick things off
    $(init);

    return app;
});