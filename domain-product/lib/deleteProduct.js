module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteProduct'
}, function (data, aggregate) {
  aggregate.apply('orderDeleted', data);
});