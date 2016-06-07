module.exports = require('cqrs-domain').defineCommand({
  name: 'createOrder'
}, function (data, aggregate) {
  aggregate.apply('orderCreated', data);
});