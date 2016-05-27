// server.js is the starting point of the domain process:
//
// `node server.js` 
var colors = require('../colors')
  , msgbus = require('../msgbus')
  , eventDenormalizerConfig = require('../config/eventDenormalizer-config')
  , sagaConfig = require('../config/saga-config');

const pm = require('cqrs-saga')({
    sagaPath: __dirname + '/sagas',
    sagaStore: {
        type: 'mongodb',
        host: 'localhost',                          // optional
        port: 27017,                                // optional
        dbName: 'domain-saga',                           // optional
        collectionName: 'sagas',             // optional
        timeout: 10000                              // optional
        // authSource: 'authedicationDatabase',        // optional
        // username: 'technicalDbUser',                // optional
        // password: 'secret'                          // optional
    },
    revisionGuardStore: {
        queueTimeout: 1000,                         // optional, timeout for non-handled events in the internal in-memory queue
        queueTimeoutMaxLoops: 3,                     // optional, maximal loop count for non-handled event in the internal in-memory queue

        type: 'redis',
        host: 'localhost',                          // optional
        port: 6379,                                 // optional
        db: 0,                                      // optional
        prefix: 'readmodel_revision',               // optional
        timeout: 10000                              // optional
        // password: 'secret'                          // optional
    }
});

pm.defineEvent(sagaConfig.eventDefinition);

pm.defineCommand(sagaConfig.commandDefinition);

var eventDenormalizerOptions = {
    denormalizerPath: __dirname + '/viewBuilders',
    repository: eventDenormalizerConfig.repository,
    revisionGuardStore: eventDenormalizerConfig.revisionGuardStore
};

const denormalizer = require('cqrs-eventdenormalizer')(eventDenormalizerOptions);

denormalizer.defineEvent(eventDenormalizerConfig.eventDefinition);

denormalizer.init(function(err) {
    if(err) {
        console.log(err);
    }

    pm.init(function(err) {
        if (err) {
            return console.log(err);
        }

        msgbus.onEvent(function(evt) {
            console.log(colors.blue('\nsaga -- received event ' + evt.event + ' from redis:'));
            console.log(evt);
        
            console.log(colors.cyan('\n-> handle event ' + evt.event));
            
            denormalizer.handle(evt, (errs) => {
                if (errs) {
                  console.error(errs);
                }
            });
        });

        pm.onCommand(function(cmd){
            console.log('saga: ' + cmd.command);
            msgbus.emitCommand(cmd);
        })

        denormalizer.defaultEventExtension((evt, callback) => {
            pm.handle(evt, (err) => {
                callback(err, evt);
            });
        });

        console.log('Starting saga service'.cyan);
    });
});


