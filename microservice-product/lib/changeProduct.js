module.exports = require('cqrs-domain').defineCommand({
  name: 'changeProduct'
}, function (data, aggregate) {
  aggregate.apply('productChanged', data);
});