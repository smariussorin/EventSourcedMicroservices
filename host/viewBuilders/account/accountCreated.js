module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'accountCreated',
  id: 'payload.id'
}, 'create');