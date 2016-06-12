app.factory('productRepository', [
    '$resource',
    function ($resource) {
        return $resource("api/product/:id",
                { id: "@id" },
                {
                    'query': {
                        method: 'GET',
                        url: 'api/product'
                    }
                });
    }]);