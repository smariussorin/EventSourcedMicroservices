module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'accountDeleted',
  aggregate: 'account',
  id: 'payload.id'
}, 'delete');