module.exports = require('cqrs-domain').defineCommand({
  name: 'changeCategory'
}, function (data, aggregate) {
  aggregate.apply('categoryChanged', data);
});