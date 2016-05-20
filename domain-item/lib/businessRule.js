module.exports = require('cqrs-domain').defineBusinessRule({
  name: 'checkForError'
}, function (changed, previous, events, command) {
  
  console.log("------changed------");
  console.log(changed);
  console.log("------changed payload-----");
  console.log(changed.uncommittedEvents);
  console.log("------previous------");
  console.log(previous);
  console.log("------events------");
  console.log(events);
  console.log("------command------");
  console.log(command);

  if (changed.get('userId') == null) {
      throw new Error('userId cannot be empty');
  }

  if (changed.get('text') == null) {
      throw new Error('text cannot be empty');
  }
});