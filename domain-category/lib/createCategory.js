module.exports = require('cqrs-domain').defineCommand({
  name: 'createCategory'
}, function (data, aggregate) {
  aggregate.apply('categoryCreated', data);
});