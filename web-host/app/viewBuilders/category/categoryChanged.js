module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'categoryChanged',
  aggregate: 'category',
  id: 'payload.id'
}, 'update');