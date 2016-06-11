module.exports = require('cqrs-domain').defineEvent({
  name: 'userChanged'
},
function (data, aggregate) {
  aggregate.set(data);
});