module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'orderChanged',
  aggregate: 'order',
  id: 'payload.id'
}, 'update');