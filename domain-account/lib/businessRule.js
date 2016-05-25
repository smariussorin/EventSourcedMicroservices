module.exports = require('cqrs-domain').defineBusinessRule({
  name: 'checkForError'
}, function (changed, previous, events, command) {
  if (changed.get('name') == null) {
     throw new Error('name cannot be empty');
  }
});