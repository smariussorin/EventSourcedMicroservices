module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'accountChanged',
  aggregate: 'account',
  id: 'payload.id'
}, 'update');