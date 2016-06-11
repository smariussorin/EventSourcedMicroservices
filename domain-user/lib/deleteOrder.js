module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteUser'
}, function (data, aggregate) {
  aggregate.apply('userDeleted', data);
});