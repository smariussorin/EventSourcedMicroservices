module.exports = require('cqrs-saga').defineSaga({
  name: 'accountDeleted',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
function (evt, saga, callback) {
  var userId =  evt.payload.id;

  const itemsRepo = require('../viewBuilders/item/collection');
  itemsRepo.findViewModels({ userId: userId }, (err, vms) => {
    vms.forEach(function(entry) {
      var cmd = {
        command: 'deleteItem',
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
