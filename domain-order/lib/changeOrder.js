module.exports = require('cqrs-domain').defineCommand({
  name: 'changeOrder'
}, function (data, aggregate) {
  aggregate.apply('orderChanged', data);
});