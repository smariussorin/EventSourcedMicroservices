exports.actions = function(app, options, repository) {

    var categoryRepo = repository.extend({
        collectionName: 'category'
    });

    app.get('/api/category', function(req, res) { 
        categoryRepo.find(function(err, categories) {
            if (err) {
                return res.send('error', { error: err });
            }

            return res.json({items: categories});
        });
    });

    app.get('/api/category/:id', function(req, res) { 
        var categoryId = req.params.id;
        categoryRepo.get(categoryId, function(err, category) {
            if (err) {
                return res.send('error', { error: err });
            }

            if(category == null)
            {
                res.statusCode = 404;
                return res.send({ error: 'Something failed!' });
            }

            return res.json(category);
        });
    });
};