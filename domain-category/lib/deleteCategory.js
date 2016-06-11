module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteCategory'
}, function (data, aggregate) {
  aggregate.apply('categoryDeleted', data);
});