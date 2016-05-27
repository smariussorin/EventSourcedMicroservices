// server.js is the starting point of the host process:
//
// `node server.js` 
var express = require('express')
  , http = require('http')
  , colors = require('../colors')
  , socket = require('socket.io')
  , viewmodel = require('viewmodel')
  , eventDenormalizerConfig = require('../config/eventDenormalizer-config');

// create an configure:
//
// - express webserver
// - socket.io socket communication from/to browser
var app = express()
  , server = http.createServer(app)
  , io = socket.listen(server);

app.use(require('body-parser').json());
app.use(express['static'](__dirname + '/public'));

app.set('view engine', 'jade');
app.set('views', __dirname + '/app/views');


// BOOTSTRAPPING
console.log('\nBOOTSTRAPPING:'.cyan);

var eventDenormalizerOptions = {
    denormalizerPath: __dirname + '/viewBuilders',
    repository: eventDenormalizerConfig.repository,
    revisionGuardStore: eventDenormalizerConfig.revisionGuardStore
};

console.log('1. -> viewmodel'.cyan);
viewmodel.read(eventDenormalizerOptions.repository, function(err, repository) {

    var eventDenormalizer = require('cqrs-eventdenormalizer')(eventDenormalizerOptions);
    
    eventDenormalizer.defineEvent(eventDenormalizerConfig.eventDefinition);

    console.log('2. -> eventdenormalizer'.cyan);
    eventDenormalizer.init(function(err) {
        if(err) {
            console.log(err);
        }

        console.log('3. -> routes'.cyan);
        require('./app/routes').actions(app, eventDenormalizerOptions, repository);

        console.log('4. -> message bus'.cyan);
        var msgbus = require('../msgbus');

        // on receiving an __event__ from redis via the hub module:
        //
        // - let it be handled from the eventDenormalizer to update the viewmodel storage
        msgbus.onEvent(function(data) {
            console.log(colors.cyan('eventDenormalizer -- denormalize event ' + data.event));
            eventDenormalizer.handle(data);
        });

        // on receiving an __event__ from eventDenormalizer module:
        //
        // - forward it to connected browsers via socket.io
        eventDenormalizer.onEvent(function(evt) {
            console.log(colors.magenta('\nsocket.io -- publish event ' + evt.event + ' to browser'));
            io.sockets.emit('events', evt);
        });

        // SETUP COMMUNICATION CHANNELS

        // on receiving __commands__ from browser via socket.io emit them on the ĥub module (which will 
        // forward it to message bus (redis pubsub))
        io.sockets.on('connection', function(socket) {
            console.log(colors.magenta(' -- connects to socket.io'));
            
            socket.on('commands', function(data) {
                console.log(colors.magenta('\n -- sends command ' + data.command + ':'));
                console.log(data);

                msgbus.emitCommand(data);
            });
        });

        // START LISTENING
        var port = 3000;
        console.log(colors.cyan('\nStarting server on port ' + port));
        server.listen(port);
    });
});