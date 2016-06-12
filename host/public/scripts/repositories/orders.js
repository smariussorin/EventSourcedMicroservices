app.factory('orderRepository', [
    '$resource',
    function ($resource) {
        return $resource("api/order/:id",
                { id: "@id" },
                {
                    'query': {
                        method: 'GET',
                        url: 'api/order'
                    }
                });
    }]);