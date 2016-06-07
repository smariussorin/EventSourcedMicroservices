exports.actions = function(app, options, repository) {
	require('./routes/account').actions(app, options, repository);
	require('./routes/order').actions(app, options, repository);
};