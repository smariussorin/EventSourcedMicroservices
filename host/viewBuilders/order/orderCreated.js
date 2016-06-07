module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'orderCreated',
  id: 'payload.id'
}, 'create');