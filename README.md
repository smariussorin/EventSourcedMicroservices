FORKED FROM https://github.com/adrai/cqrs-sample

## Introduction

This is a sample implementation of CQRS / Eventsourcing Infrastructure in node.js using:

### get it up and running
        
1.  start server in _host_ and _domain_ folder

        node server.js
        
1.  direct your browser to 

        http://localhost:3000
        
the source code is well documented to understand the core principles.

The API is designed well so you can focus on the domain without worring to much about the infrastructure.

- [domain](https://github.com/adrai/node-cqrs-domain)
- [eventdenormalizing](https://github.com/adrai/node-cqrs-eventdenormalizer)
- [viewmodel, read/write repository](https://github.com/adrai/node-viewmodel)
- [eventstore](https://github.com/jamuhl/nodeEventStore)
- [proper dequeing](https://github.com/adrai/node-queue)
- [business-rules and validation](https://github.com/adrai/rule-validator)
- [message bus](https://github.com/adrai/rabbitmq-nodejs-client)

- [without distributing](https://github.com/adrai/node-cqs)


Documentation can be found [here](http://adrai.github.com/cqrs/)
