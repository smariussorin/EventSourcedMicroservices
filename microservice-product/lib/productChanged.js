module.exports = require('cqrs-domain').defineEvent({
  name: 'productChanged'
},
function (data, aggregate) {
  aggregate.set(data);
});