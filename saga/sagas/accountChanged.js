module.exports = require('cqrs-saga').defineSaga({
  name: 'accountChanged',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
function (evt, saga, callback) {
    var cmd = {
        command: 'createItem',
        payload: {
            text : 'hello',
        }
    };

    saga.addCommandToSend(cmd);
    saga.commit(callback);
});
