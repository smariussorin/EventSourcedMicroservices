exports.actions = function(app, options, repository) {
	require('./routes/account').actions(app, options, repository);
	require('./routes/item').actions(app, options, repository);
};