module.exports = require('cqrs-domain').defineAggregate({
  // optional, default is last part of path name
  name: 'product',
  
  // optional, default ''
  defaultCommandPayload: 'payload',
  
  // optional, default ''
  defaultEventPayload: 'payload',

  // optional, default ''
  defaultPreConditionPayload: 'payload',
});