module.exports = {
    eventDefinition: {
		name: 'event',
		aggregateId: 'payload.id',
	    aggregate: 'aggregate.name',
		payload: 'payload',
		revision: 'head.revision',
		meta: 'meta'
	},
    commandDefinition: {
		id: 'id',
		meta: 'meta'
	}
}