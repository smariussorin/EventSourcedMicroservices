exports.actions = function(app, options, repository) {

    var orderRepo = repository.extend({
        collectionName: 'order'
    });

    app.get('/api/order', function(req, res) { 
        orderRepo.find(function(err, orders) {
            if (err) {
                return res.send('error', { error: err });
            }

            return res.json({items: orders});
        });
    });

    app.get('/api/order/:id', function(req, res) { 
        var orderId = req.params.id;
        orderRepo.get(orderId, function(err, order) {
            if (err) {
                return res.send('error', { error: err });
            }

            if(order == null)
            {
                res.statusCode = 404;
                return res.send({ error: 'Something failed!' });
            }

            return res.json(order);
        });
    });
};