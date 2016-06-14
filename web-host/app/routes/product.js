exports.actions = function(app, options, repository) {

    var productRepo = repository.extend({
        collectionName: 'product'
    });

    app.get('/api/product', function(req, res) { 
        productRepo.find(function(err, products) {
            if (err) {
                return res.send('error', { error: err });
            }

            return res.json({items: products});
        });
    });

    app.get('/api/product/:id', function(req, res) { 
        var productId = req.params.id;
        productRepo.get(productId, function(err, product) {
            if (err) {
                return res.send('error', { error: err });
            }

            if(product == null)
            {
                res.statusCode = 404;
                return res.send({ error: 'Something failed!' });
            }

            return res.json(product);
        });
    });
};