module.exports = require('cqrs-saga').defineSaga({
  name: 'productDeleted',
  aggregate: 'product',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
function (evt, saga, callback) {
  var productId =  evt.payload.id;

  const ordersRepo = require('../viewBuilders/order/collection');
  ordersRepo.findViewModels({ }, (err, orders) => {
    orders.forEach(function(entry) {
      var productDelected = entry.attributes.products.filter(function(o){return o.id == productId;} )[0];
      if(productDelected)
      {
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
      }
    }); 
  });

  saga.commit(callback);
});
