module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'accountDeleted',
  id: 'payload.id'
}, 'delete');