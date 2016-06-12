module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'productCreated',
  aggregate: 'product',
  id: 'payload.id'
}, 'create');