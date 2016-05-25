(function() {

    // Create Backbone Model and Collection
    // ------------------------------------

    // model
    var Account = Backbone.Model.extend({
        modelName: 'account', // so denormalizers can resolve events to model
        
        initialize: function() {
            // bind this model to get event updates - a lot of magic ;)
            // not more to do the model gets updated now
            this.bindCQRS(); 
        }
    });

    // collection
    var Accounts = Backbone.Collection.extend({
        model: Account,
        url: '/allAccounts.json'
    });

    var accounts = new Accounts();


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

    // accountCreated event 
    var accountCreateHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: Account,
        collection: accounts,

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

    // view templates
    var accountTemplate = _.template('<%= email %> <a class="deleteAccount" href="">delete</a> <a class="editAccount" href="">edit</a>');
    var editAccountTemplate = _.template('<input id="newEmail" type="text" value="<%= email %>"></input><input id="newName" type="text" value="<%= name %>"></input><button id="changeAccount">save</button>');

    // views
    var AccountView = Backbone.View.extend({
        
        tagName: 'li',
        className: 'account',

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
                }
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
                    }
                });

                cmd.observe(function(event) {
                    console.log("Callback deleteAccount reveived event: " + event.name);
                });

                // emit it
                cmd.emit();
            }
        },

        render: function() {
            if (this.model.editMode) {
                $(this.el).html(editAccountTemplate(this.model.toJSON()));
            } else {
                $(this.el).html(accountTemplate(this.model.toJSON()));
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
                    }
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
        app.accounts = accounts;
        app.accounts.fetch();

        var indexView = new IndexView();
        indexView.render();
    };

    // kick things off
    $(init);

})();