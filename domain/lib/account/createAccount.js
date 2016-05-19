module.exports = require('cqrs-domain').defineCommand({
  name: 'createAccount'
}, function (data, aggregate) {
  aggregate.apply('accountCreated', data);
});