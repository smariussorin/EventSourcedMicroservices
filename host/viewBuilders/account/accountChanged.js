module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'accountChanged',
  id: 'payload.id'
}, 'update');