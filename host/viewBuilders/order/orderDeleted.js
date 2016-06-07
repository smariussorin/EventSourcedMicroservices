module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'orderDeleted',
  id: 'payload.id'
}, 'delete');