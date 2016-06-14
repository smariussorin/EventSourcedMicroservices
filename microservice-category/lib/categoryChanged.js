module.exports = require('cqrs-domain').defineEvent({
  name: 'categoryChanged'
},
function (data, aggregate) {
  aggregate.set(data);
});