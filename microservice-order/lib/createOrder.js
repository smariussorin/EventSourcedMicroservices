module.exports = require('cqrs-domain').defineCommand({
  name: 'createOrder'
}, function (data, aggregate) {
  data.createdAt = new Date();
  aggregate.apply('orderCreated', data);
});