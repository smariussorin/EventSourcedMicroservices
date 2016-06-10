module.exports = require('cqrs-domain').defineBusinessRule({
  name: 'checkForError'
}, function (changed, previous, events, command) {
  /*if (changed.get('userId') == null) {
      throw new Error('userId cannot be empty');
  }

  if (changed.get('text') == null) {
      throw new Error('text cannot be empty');
  }*/
});