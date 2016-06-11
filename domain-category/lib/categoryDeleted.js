module.exports = require('cqrs-domain').defineEvent({
  name: 'categoryDeleted'
},
function (data, aggregate) {
  aggregate.destroy();
});