exports.actions = function(app, options, repository) {

    var itemRepo = repository.extend({
        collectionName: 'item'
    });
	
    app.get('/items', function(req, res) {
        res.render('items-index');
    });
        
    app.get('/allItems.json', function(req, res) { 
        itemRepo.find(function(err, items) {
            if (err) res.json({});
                
            res.json(items);
        });
    });
	
	var accountRepo = repository.extend({
        collectionName: 'account'
    });
	
    app.get('/accounts', function(req, res) {
        res.render('accounts-index');
    });
        
    app.get('/allAccounts.json', function(req, res) { 
        accountRepo.find(function(err, accounts) {
            if (err) res.json({});
                
            res.json(accounts);
        });
    });

};