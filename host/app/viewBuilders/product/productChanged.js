module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'productChanged',
  aggregate: 'product',
  id: 'payload.id'
}, 'update');