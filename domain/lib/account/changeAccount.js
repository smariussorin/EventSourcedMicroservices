module.exports = require('cqrs-domain').defineCommand({
  name: 'changeAccount'
}, function (data, aggregate) {
  aggregate.apply('accountChanged', data);
});