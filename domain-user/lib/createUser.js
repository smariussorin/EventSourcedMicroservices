module.exports = require('cqrs-domain').defineCommand({
  name: 'createUser'
}, function (data, aggregate) {
  data.createdAt = new Date();
  aggregate.apply('userCreated', data);
});