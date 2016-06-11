module.exports = require('cqrs-domain').defineEvent({
  name: 'productCreated'
},
function (data, aggregate) {
  aggregate.set(data);
});