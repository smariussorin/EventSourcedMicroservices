module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'categoryCreated',
  aggregate: 'category',
  id: 'payload.id'
}, 'create');