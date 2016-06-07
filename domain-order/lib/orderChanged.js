module.exports = require('cqrs-domain').defineEvent({
  name: 'orderChanged'
},
function (data, aggregate) {
  aggregate.set(data);
});