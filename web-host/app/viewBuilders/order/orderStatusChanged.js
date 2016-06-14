module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'orderStatusChanged',
  aggregate: 'order',
  id: 'payload.id'
}, 'update');