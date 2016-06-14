module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'productDeleted',
  aggregate: 'product',
  id: 'payload.id'
}, 'delete');