exports.actions = function(app, options, repository) {
	require('./routes/category').actions(app, options, repository);
	require('./routes/product').actions(app, options, repository);
	require('./routes/order').actions(app, options, repository);
};