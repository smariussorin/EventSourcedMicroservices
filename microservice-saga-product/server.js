// server.js is the starting point of the domain process:
//
// `node server.js` 
var colors = require('../colors')
  , msgbus = require('../msgbus')
  , log4js = require('log4js')
  , eventDenormalizerConfig = require('../config/eventDenormalizer-config')
  , sagaConfig = require('../config/saga-config');

//configurate logger
log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'log4js-node-mongodb',
            connectionString: 'localhost:27017/logs',
            category: 'saga-product'
        }
    ]
});

var logger = log4js.getLogger('saga-product');

//configurate saga
const saga = require('cqrs-saga')({
    sagaPath: __dirname + '/sagas',
    sagaStore: {
        type: 'mongodb',
        host: 'localhost',                          // optional
        port: 27017,                                // optional
        dbName: 'domain-saga-product',             // optional
        collectionName: 'sagas',                    // optional
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
        prefix: 'readmodel-saga-product-revision',  // optional
        timeout: 10000,                              // optional
        password: 'ztEB@DSWP^3P5Zt'                 // optional
    }
});

saga.defineEvent(sagaConfig.eventDefinition);

saga.defineCommand(sagaConfig.commandDefinition);

var eventDenormalizerOptions = {
    denormalizerPath: __dirname + '/viewBuilders',
    repository: eventDenormalizerConfig.repository,
    revisionGuardStore: eventDenormalizerConfig.revisionGuardStore
};

const denormalizer = require('cqrs-eventdenormalizer')(eventDenormalizerOptions);

denormalizer.defineEvent(eventDenormalizerConfig.eventDefinition);

denormalizer.init(function(err) {
    if(err) {
        logger.error(err);
    }

    saga.init(function(err) {
        if (err) {
            return logger.error(err);
        }

        msgbus.onEvent(function(evt) {
            logger.info(colors.blue('\nsaga -- received event ' + evt.event + ' from redis:'));
            logger.info(evt);
        
            logger.info(colors.cyan('\n-> handle event ' + evt.event));
            
            denormalizer.handle(evt, (errs) => {
                if (errs) {
                  logger.error(errs);
                }
            });
        });

        saga.onCommand(function(cmd){
            logger.info('saga: ' + cmd.command);
            msgbus.emitCommand(cmd);
        })

        saga.onEventMissing(function (info, evt) {
            logger.warn('\n Missed event ' + evt.event + ':');
            logger.warn(evt);
            logger.warn(info);

            /*
            saga.handle(evt, function (err) {
                if (err) { logger.error(err); }
            });
            */
        });

        denormalizer.defaultEventExtension((evt, callback) => {
            saga.handle(evt, (err) => {
                callback(err, evt);
            });
        });

        logger.trace('Starting Product Saga Microservice'.cyan);
    });
});


