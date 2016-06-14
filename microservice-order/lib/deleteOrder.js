module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteOrder'
}, function (data, aggregate) {
  aggregate.apply('orderDeleted', data);
});