module.exports = require('cqrs-saga').defineSaga({
  name: 'categoryDeleted',
  aggregate: 'category',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
function (evt, saga, callback) {
  var categoryId =  evt.payload.id;
  
  const productsRepo = require('../viewBuilders/product/collection');
  productsRepo.findViewModels({ categoryId: categoryId }, (err, products) => {
    products.forEach(function(entry) {
      var cmd = {
        command: 'deleteProduct',
        aggregate: { 
          name: 'product'
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
