module.exports = require('cqrs-domain').defineCommand({
  name: 'changeStatusOrder'
}, function (data, aggregate) {
  aggregate.apply('orderStatusChanged', data);
});