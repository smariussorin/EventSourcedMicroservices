module.exports = require('cqrs-domain').defineEvent({
  name: 'accountCreated'
},
function (data, aggregate) {
  aggregate.set(data);
});