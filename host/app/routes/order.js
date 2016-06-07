exports.actions = function(app, options, repository) {

    var orderRepo = repository.extend({
        collectionName: 'order'
    });
	
    app.get('/orders', function(req, res) {
        res.render('../templates/order/index');
    });
        
    app.get('/allOrders.json', function(req, res) { 
        orderRepo.find(function(err, orders) {
            if (err) res.json({});
                
            res.json(orders);
        });
    });
};