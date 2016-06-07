module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  name: 'orderChanged',
  id: 'payload.id'
}, 'update');