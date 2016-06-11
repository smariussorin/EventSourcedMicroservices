module.exports = {
    eventStore: {
        type: 'mongodb',
        host: 'localhost',                          // optional
        port: 27017,                                // optional
        dbName: 'domain',                           // optional
        eventsCollectionName: 'events',             // optional
        snapshotsCollectionName: 'snapshots',       // optional 
        transactionsCollectionName: 'transactions', // optional
        timeout: 10000                              // optional
      // authSource: 'authedicationDatabase',        // optional
        // username: 'technicalDbUser',                // optional
        // password: 'secret'                          // optional
    },
    eventDefinition : {
        correlationId: 'commandId',
        id: 'id',
        name: 'event',
        aggregateId: 'payload.id',
        aggregate: 'aggregate.name',
        payload: 'payload',
        revision: 'head.revision',
        meta: 'meta'
    },
    commandDefinition: {
        id: 'id',
        name: 'command',
        aggregateId: 'payload.id',
        aggregate: 'aggregate.name',
        payload: 'payload',
        revision: 'head.revision',
        meta: 'meta'
    }
}
