module.exports = require('cqrs-saga').defineSaga({
  name: 'accountDeleted',
  aggregate: 'account',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
function (evt, saga, callback) {
  var userId =  evt.payload.id;
  const ordersRepo = require('../viewBuilders/order/collection');
  ordersRepo.findViewModels({ userId: userId }, (err, vms) => {
    vms.forEach(function(entry) {
      var cmd = {
        command: 'deleteOrder',
        aggregate: { 
          name: 'order'
        },
        payload: {
          id : entry.id,
        },
        meta: evt.meta
      };

      saga.addCommandToSend(cmd);
    }); 
  });

  saga.commit(callback);
});
