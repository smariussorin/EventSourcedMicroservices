module.exports = require('cqrs-domain').defineEvent({
  name: 'userCreated'
},
function (data, aggregate) {
  aggregate.set(data);
});