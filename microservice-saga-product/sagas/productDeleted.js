module.exports = require('cqrs-saga').defineSaga({
  name: 'productDeleted',
  aggregate: 'product',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
function (evt, saga, callback) {
  var productId =  evt.payload.id;

  const ordersRepo = require('../viewBuilders/order/collection');
  ordersRepo.findViewModels({ 'products.id': productId }, (err, orders) => {
    orders.forEach(function(entry) {
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
    
    saga.commit(callback);
  });

});
