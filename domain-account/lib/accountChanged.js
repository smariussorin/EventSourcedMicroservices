module.exports = require('cqrs-domain').defineEvent({
  name: 'accountChanged'
},
function (data, aggregate) {
  aggregate.set(data);
});