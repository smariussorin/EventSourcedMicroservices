module.exports = require('cqrs-domain').defineCommand({
  name: 'changeUser'
}, function (data, aggregate) {
  aggregate.apply('userChanged', data);
});