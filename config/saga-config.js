module.exports = {
    eventDefinition: {
		name: 'event',
		aggregateId: 'payload.id',
		payload: 'payload',
		revision: 'head.revision',
		meta: 'meta'
	},
    commandDefinition: {
		id: 'id',
		meta: 'meta'
	}
}