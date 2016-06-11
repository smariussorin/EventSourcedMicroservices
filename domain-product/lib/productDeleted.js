module.exports = require('cqrs-domain').defineEvent({
  name: 'productDeleted'
},
function (data, aggregate) {
  aggregate.destroy();
});