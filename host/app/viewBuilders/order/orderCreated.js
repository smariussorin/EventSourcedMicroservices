module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'orderCreated',
  aggregate: 'order',
  id: 'payload.id'
}, 'create');