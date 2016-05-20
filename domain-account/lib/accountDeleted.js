module.exports = require('cqrs-domain').defineEvent({
  name: 'accountDeleted'
},
function (data, aggregate) {
  aggregate.destroy();
});