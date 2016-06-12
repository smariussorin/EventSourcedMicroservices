app.factory('categoryRepository', [
    '$resource',
    function ($resource) {
        return $resource("api/category/:id",
                { id: "@id" },
                {
                    'query': {
                        method: 'GET',
                        url: 'api/category',
                    }
                });
    }]);