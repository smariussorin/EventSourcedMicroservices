module.exports = require('cqrs-domain').defineEvent({
  name: 'orderStatusChanged'
},
function (data, aggregate) {
  aggregate.set(data);
});