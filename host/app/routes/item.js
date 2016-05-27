exports.actions = function(app, options, repository) {

    var itemRepo = repository.extend({
        collectionName: 'item'
    });
	
    app.get('/items', function(req, res) {
        res.render('../templates/item/index');
    });
        
    app.get('/allItems.json', function(req, res) { 
        itemRepo.find(function(err, items) {
            if (err) res.json({});
                
            res.json(items);
        });
    });
};