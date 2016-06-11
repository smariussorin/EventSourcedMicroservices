module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'accountCreated',
  aggregate: 'account',
  id: 'payload.id'
}, 'create');