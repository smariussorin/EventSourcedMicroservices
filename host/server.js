// server.js is the starting point of the host process:
//
// `node server.js` 
var express = require('express')
  , http = require('http')
  , colors = require('../colors')
  , log4js = require('log4js')
  , socket = require('socket.io')
  , viewmodel = require('viewmodel')
  , eventDenormalizerConfig = require('../config/eventDenormalizer-config');

//configurate logger
log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'log4js-node-mongodb',
            connectionString: 'localhost:27017/logs',
            category: 'host'
        }
    ]
});

var logger = log4js.getLogger('host');

// create an configure:
//
// - express webserver
// - socket.io socket communication from/to browser
var app = express()
  , server = http.createServer(app)
  , io = socket.listen(server);

app.use(require('body-parser').json());
app.use(express['static'](__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules'));

app.set('view engine', 'jade');
app.set('views', __dirname + '/public/views');


// BOOTSTRAPPING
logger.trace('\nBOOTSTRAPPING:'.cyan);

var eventDenormalizerOptions = {
    denormalizerPath: __dirname + '/viewBuilders',
    repository: eventDenormalizerConfig.repository,
    revisionGuardStore: eventDenormalizerConfig.revisionGuardStore
};

logger.trace('1. -> viewmodel'.cyan);
viewmodel.read(eventDenormalizerOptions.repository, function(err, repository) {

    var eventDenormalizer = require('cqrs-eventdenormalizer')(eventDenormalizerOptions);
    
    eventDenormalizer.defineEvent(eventDenormalizerConfig.eventDefinition);

    logger.trace('2. -> eventdenormalizer'.cyan);
    eventDenormalizer.init(function(err) {
        if(err) {
            logger.error(err);
        }

        logger.trace('3. -> routes'.cyan);
        require('./app/routes').actions(app, eventDenormalizerOptions, repository);

        logger.trace('4. -> message bus'.cyan);
        var msgbus = require('../msgbus');

        // on receiving an __event__ from redis via the hub module:
        //
        // - let it be handled from the eventDenormalizer to update the viewmodel storage
        msgbus.onEvent(function(data) {
            logger.info(colors.cyan('eventDenormalizer -- denormalize event ' + data.event));
            eventDenormalizer.handle(data);
        });

        // on receiving an __event__ from eventDenormalizer module:
        //
        // - forward it to connected browsers via socket.io
        eventDenormalizer.onEvent(function(evt) {
            logger.info(colors.magenta('\nsocket.io -- publish event ' + evt.event + ' to browser'));
            io.sockets.emit('events', evt);
        });

        // SETUP COMMUNICATION CHANNELS

        // on receiving __commands__ from browser via socket.io emit them on the ĥub module (which will 
        // forward it to message bus (redis pubsub))
        io.sockets.on('connection', function(socket) {
            logger.trace(colors.magenta(' -- connects to socket.io'));
            
            socket.on('commands', function(data) {
                logger.info(colors.magenta('\n -- sends command ' + data.command + ':'));
                logger.info(data);

                msgbus.emitCommand(data);
            });
        });

        // START LISTENING
        var port = 3000;
        logger.trace(colors.cyan('\nStarting server on port ' + port));
        server.listen(port);
    });
});