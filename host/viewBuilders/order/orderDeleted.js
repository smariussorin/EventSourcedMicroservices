module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'orderDeleted',
  aggregate: 'order',
  id: 'payload.id'
}, 'delete');