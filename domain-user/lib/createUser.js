module.exports = require('cqrs-domain').defineCommand({
  name: 'createUser'
}, function (data, aggregate) {
  aggregate.apply('userCreated', data);
});