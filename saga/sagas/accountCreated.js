module.exports = require('cqrs-saga').defineSaga({
  name: 'accountCreated',
  aggregate: 'account',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
function (evt, saga, callback) {
    var cmd = {
        command: 'createOrder',
        aggregate: { 
          name: 'order'
        },
        payload: {
          date: "2013-06-26T07:15:32.914Z",
          placedby : "Marlon Hancock "+ evt.payload.email,
          status : "sent",
          quantity : 17,
          total : 318,
          shipto : "173 Donec Ave Sandwich",
          selected : false
        },
        meta: evt.meta 
    };

    saga.addCommandToSend(cmd);
    saga.commit(callback);
});
