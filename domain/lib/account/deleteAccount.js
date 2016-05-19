module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteAccount'
}, function (data, aggregate) {
  aggregate.apply('accountDeleted', data);
});