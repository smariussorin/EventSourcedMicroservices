module.exports = require('cqrs-domain').defineEvent({
  name: 'orderDeleted'
},
function (data, aggregate) {
  aggregate.destroy();
});