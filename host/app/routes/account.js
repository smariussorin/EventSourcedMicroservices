exports.actions = function(app, options, repository) {

	var accountRepo = repository.extend({
        collectionName: 'account'
    });
	
    app.get('/accounts', function(req, res) {
        res.render('../views/accounts/index');
    });
        
    app.get('/allAccounts.json', function(req, res) { 
        accountRepo.find(function(err, accounts) {
            if (err) res.json({});
                
            res.json(accounts);
        });
    });
};