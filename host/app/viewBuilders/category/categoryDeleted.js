module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'categoryDeleted',
  aggregate: 'category',
  id: 'payload.id'
}, 'delete');