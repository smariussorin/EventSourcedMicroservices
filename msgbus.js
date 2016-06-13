// the hub encapsulates functionality to send or receive messages from redis.
var redisOptions = {
    host: 'localhost',                       
    port: 6379,
    password: 'ztEB@DSWP^3P5Zt'
}

var redis = require('redis')
  , colors = require('./colors')
  , log4js = require('log4js')
  , cmd = redis.createClient(redisOptions)
  , evt = redis.createClient(redisOptions)
  , evtSubscriptions = []
  , cmdSubscriptions = [];

//configurate logger
log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'log4js-node-mongodb',
            connectionString: 'localhost:27017/logs',
            category: 'message-bus'
        }
    ]
});

var logger = log4js.getLogger('message-bus');

//configurate
module.exports = {

    emitCommand: function(command) {
        logger.trace(colors.blue('\nhub -- publishing command ' + command.command + ' to redis:'));
        logger.trace(command);
        cmd.publish('commands', JSON.stringify(command));
    },

    onCommand: function(callback) {
        if (cmdSubscriptions.length === 0) {
            // subscribe to __commands channel__
            cmd.subscribe('commands');
        }
        cmdSubscriptions.push(callback);
        logger.trace(colors.blue('hub -- command subscribers: ' + cmdSubscriptions.length));
    },

    emitEvent: function(event) {
        logger.trace(colors.blue('\nhub -- publishing event ' + event.event + ' to redis:'));
        logger.trace(event);
        evt.publish('events', JSON.stringify(event));
    },

    onEvent: function(callback) {
        if (evtSubscriptions.length === 0) {
            // subscribe to __events channel__
            evt.subscribe('events');
        }
        evtSubscriptions.push(callback);
        logger.trace(colors.blue('hub -- event subscribers: ' + evtSubscriptions.length));
    }

};

// listen to events from redis and call each callback from subscribers
evt.on('message', function(channel, message) {

    var event = JSON.parse(message);

    if (channel === 'events') {

        logger.trace(colors.green('\nhub -- received event ' + event.event + ' from redis:'));
        logger.trace(event);
        
        evtSubscriptions.forEach(function(subscriber){
            subscriber(event);
        });

    }
});

// listen to commands from redis and call each callback from subscribers
cmd.on('message', function(channel, message) {

    var command = JSON.parse(message);

    if (channel === 'commands') {

        logger.trace(colors.green('\nhub -- received command ' + command.command + ' from redis:'));
        logger.trace(command);
        
        cmdSubscriptions.forEach(function(subscriber){
            subscriber(command);
        });

    }
});