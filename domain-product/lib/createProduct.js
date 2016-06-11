module.exports = require('cqrs-domain').defineCommand({
  name: 'createProduct'
}, function (data, aggregate) {
  aggregate.apply('productCreated', data);
});