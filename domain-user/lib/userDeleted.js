module.exports = require('cqrs-domain').defineEvent({
  name: 'userDeleted'
},
function (data, aggregate) {
  aggregate.destroy();
});