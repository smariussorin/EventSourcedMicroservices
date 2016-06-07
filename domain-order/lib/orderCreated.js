module.exports = require('cqrs-domain').defineEvent({
  name: 'orderCreated'
},
function (data, aggregate) {
  aggregate.set(data);
});