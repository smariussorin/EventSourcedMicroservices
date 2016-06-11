module.exports = require('cqrs-domain').defineEvent({
  name: 'categoryCreated'
},
function (data, aggregate) {
  aggregate.set(data);
});