'use strict';

app

  .controller('OrdersCtrl', ['$scope', 'StoreService', '$filter', 'user',
    function($scope, StoreService, $filter, user) {

      $scope.aggregate = "order";

      var store = StoreService.createForController($scope);
      store.for($scope.aggregate).do(function () {
      });

      $scope.user = user;
      $scope.order = {};
      $scope.settings ={
        globalVAT : 19
      };
    }])

  .controller('OrdersListCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'orderRepository', '$filter', 'ngTableParams', 'toastr', '_', 
    function($scope, CQRS, DenormalizationService, orderRepository, $filter, ngTableParams, toastr, _) {

      var eventNameDelete = "orderDeleted";
      var commandNameDelete = "deleteOrder";
      var eventNameUpdateStatus = "orderStatusChanged";
      var commandNameUpdateStatus = "changeStatusOrder";

      var categoryDeletedDenormalizationService = DenormalizationService.getDenormalizerFunctions(eventNameDelete, $scope.aggregate);
      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName: eventNameDelete
      }, function (items, data) {
        var existingOrder = $filter('filter')($scope.orders, { id: data.payload.id }, true)[0];

        var index = $scope.orders.indexOf(existingOrder);
        if (index > -1) {
          $scope.orders.splice(index, 1);
        }
        
        toastr.success('Order Removed!', 'Order has been removed');
      });

      var categoryDeletedDenormalizationService = DenormalizationService.getDenormalizerFunctions(eventNameUpdateStatus, $scope.aggregate);
      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName: eventNameUpdateStatus
      }, function (items, data) {
        var existingOrder = $filter('filter')($scope.orders, { id: data.payload.id }, true)[0];

        if (existingOrder != null && existingOrder != undefined) {
            existingOrder.status = data.payload.status;
        } 

        toastr.success('Order Updated!', 'Order has been updated');
      });

      // Delete CRUD operation
      $scope.delete = function (order) {
        if (confirm('Are you sure?')) {
          CQRS.sendCommand({
            id:_.uniqueId('msg'),
            command: commandNameDelete,
            aggregate: { 
              name: $scope.aggregate
            },
            payload: { 
              id: order.id
            },
          });
        }
      };
      //////////////////////////// *Delete CRUD operation

      $scope.changeStatus = function (order, status) {
        CQRS.sendCommand({
            id:_.uniqueId('msg'),
            command: commandNameUpdateStatus,
            aggregate: { 
              name: $scope.aggregate
            },
            payload: { 
              id: order.id,
              status: status
            },
        });
      };

      // Initialize table
      var getOrdersPromise = orderRepository.query().$promise;
      getOrdersPromise
        .then(function (result) {
          $scope.orders = result.items;

          // watch data in scope, if change reload table
          $scope.$watchCollection('orders', function(newVal, oldVal){
            if (newVal !== oldVal) {
              $scope.tableParams.reload();
            }
          });

          $scope.$watch('searchText', function(newVal, oldVal){
            if (newVal !== oldVal) {
              $scope.tableParams.reload();
            }
          });
          ///////////////////////////////////////////// *watch data in scope, if change reload table

          $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: {
              id: 'asc'     // initial sorting
            }
          }, {
            total: $scope.orders.length, // length of data
            getData: function($defer, params) {
              // use build-in angular filter
              var orderedData = params.sorting() ?
                $filter('orderBy')($scope.orders, params.orderBy()) :
                $scope.orders;

              orderedData = $filter('filter')(orderedData, $scope.searchText);
              params.total(orderedData.length);

              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
          });
        });
      ////////////////////////////////////////// *Initialize table

    }])

 .controller('ShowOrderCtrl', ['$scope', 'orderRepository', 'productRepository', 'categoryRepository', '$state',  '$stateParams', '$filter',
    function($scope, orderRepository, productRepository, categoryRepository, $state, $stateParams, $filter) {
    var ordertId = $stateParams.id;

    var getOrderPromise = orderRepository.get({ id: ordertId }).$promise;
    getOrderPromise
      .then(function (result) {

        $scope.order = result;
        return categoryRepository.query().$promise;
      }, function(){

        $state.go('app.orders.list', {}, {reload: true});
      })
      .then(function (result) {

         $scope.categories = result.items;

         return productRepository.query().$promise;
      })
      .then(function (result) {

         $scope.products = result.items;

         angular.forEach($scope.order.products, function(value, key){
          value.extra = $filter('filter')($scope.products, { id: value.id }, true)[0];
          value.extra.category = $filter('filter')($scope.categories, { id: value.extra.categoryId }, true)[0];
        });
      });
    }])

  .controller('NewOrderCtrl', ['$scope', 'CQRS', '$state', '$stateParams', '_',
    function($scope, CQRS, $state, $stateParams, _) {

        var productId = $stateParams.productId;

        CQRS.sendCommand({
          id:_.uniqueId('msg'),
          command: 'createOrder',
          aggregate: { 
            name: $scope.aggregate
          },
          payload: {  
            "customer":{  
              "city":"Bratislava",
              "country":"Slovakia",
              "email":"johny@douey.com",
              "name":"Test Customer " + productId,
              "phone":"+421946599455",
              "street":"Bratislavska 52",
              "zip":"884 65"
            },
            "delivery":"Pick-up",
            "payment":"Cash",
            "products": [
            {  
             "id" : "575f150a4b068ec432e79936",
             "amount":3,
             "price":165.00
           },
           {  
             "id" : productId,
             "amount":1,
             "price":175.00
           }
           ],
           "shipTo":{  
            "city":"Bratislava",
            "country":"Slovakia",
            "name":"John Douey",
            "street":"Bratislavska 52",
            "zip":"884 65"
          },
          "status":"pending",
          "subTotal":670,
        },
      });

      $state.go('app.orders.list', {}, {reload: true});
    }]);



 