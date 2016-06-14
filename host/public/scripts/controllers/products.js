'use strict';

app

  .controller('ProductsCtrl', ['$scope', 'StoreService', '$filter', 'uploadImage', 'user',
    function($scope, StoreService, $filter, uploadImage, user) {

      $scope.aggregate = "product";

      var store = StoreService.createForController($scope);
      store.for($scope.aggregate).do(function () {
      });

      $scope.user = user;

      $scope.units = {
        pc: "Piece",
        kg: "Kilogram",
        g: "Gram",
        m: "Meter",
        l: "Liter"
      };

      $scope.statuses = {
        published: "published",
        notPublished: "not published",
        banned: "banned"
      };

      $scope.uploadImages = function (files, user, cb) {
        if (files && files.length) {
          uploadImage.uploadMultiple(files, user, cb);
        }
      };

      $scope.product = {};
    }])

  .controller('ProductsListCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'productRepository', 'categoryRepository', '$filter', 'ngTableParams', 'toastr', '_', 
    function($scope, CQRS, DenormalizationService, productRepository, categoryRepository, $filter, ngTableParams, toastr, _) {

      var eventName = "productDeleted";
      var commandName = "deleteProduct";

      var categoryDeletedDenormalizationService = DenormalizationService.getDenormalizerFunctions(eventName, $scope.aggregate);
      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName: eventName
      }, function (items, data) {
        var existingProduct = $filter('filter')($scope.products, { id: data.payload.id }, true)[0];

        var index = $scope.products.indexOf(existingProduct);
        if (index > -1) {
          $scope.products.splice(index, 1);
        }

        toastr.success('Product Removed!', 'Product has been removed');
      });

      // Delete CRUD operation
      $scope.delete = function (category) {
        if (confirm('Are you sure?')) {
          CQRS.sendCommand({
            id:_.uniqueId('msg'),
            command: commandName,
            aggregate: { 
              name: $scope.aggregate
            },
            payload: { 
              id: category.id
            },
          });
        }
      }
      //////////////////////////// *Delete CRUD operation

        // Initialize table
        var getCategoriesPromise = categoryRepository.query().$promise;
        getCategoriesPromise
        .then(function (result) {
          $scope.categories = result.items;

         return productRepository.query().$promise;
        })
        .then(function (result) {
          $scope.products = result.items;

          //extend array
          function extendArray(){
            angular.forEach($scope.products, function(value, key){
              if (value.categoryId){
                var existingCategory = $filter('filter')($scope.categories, { id: value.categoryId }, true)[0];
                if (existingCategory != null && existingCategory != undefined) {
                  value.category = existingCategory;
                }
              }
            });
          }
          extendArray();
          ///////////////////////////////////////////// *extend array

          // watch data in scope, if change reload table
          $scope.$watchCollection('products', function(newVal, oldVal){
            if (newVal !== oldVal) {
              extendArray();
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
            total: $scope.products.length, // length of data
            getData: function($defer, params) {
              // use build-in angular filter
              var orderedData = params.sorting() ?
                $filter('orderBy')($scope.products, params.orderBy()) :
                $scope.products;

              orderedData = $filter('filter')(orderedData, $scope.searchText);
              params.total(orderedData.length);

              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
          });
        });
        ////////////////////////////////////////// *Initialize table

      }])

  .controller('NewProductCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'productRepository', 'categoryRepository', '$state', '$filter', 'toastr', '_',
    function($scope, CQRS, DenormalizationService, productRepository, categoryRepository, $state, $filter, toastr,  _) {

      var eventName = "productCreated";
      var commandName = "createProduct";

      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName: eventName
      }, function (items, data) {
        toastr.success('Product Added!', 'Product has been created');
        $state.go('app.products.list', {}, {reload: true});
      });

        // Submit operation
        $scope.ok = function(form) {

          var x = 0;
          var cb = function(filelink){
            $scope.product.images[x] = {};
            $scope.product.images[x].src = filelink;
            x++;
            if ($scope.product.images.length === x) {
              $scope.product.images = angular.copy($scope.product.images);
              CQRS.sendCommand({
                id:_.uniqueId('msg'),
                command: commandName,
                aggregate: { 
                  name: $scope.aggregate
                },
                payload: $scope.product
              });
            }
          };

          if (form.images.$valid) {
            $scope.uploadImages($scope.product.images, $scope.user, cb);
          }
        };
        /////////////////////// *Submit operation

        var getCategoriesPromise = categoryRepository.query().$promise;
        getCategoriesPromise
        .then(function (result) {

          $scope.categories = result.items;

          $scope.childCategories = [];
          //extend array
          angular.forEach($scope.categories, function (value, key) {
            if (value.parentId){
              var existingCategory = $filter('filter')($scope.categories, { id: value.parentId }, true)[0];
              if (existingCategory != null && existingCategory != undefined) {
                value.parentName = existingCategory.name;
                $scope.childCategories.push(value);
              }
            } else {
              if ($filter('filter')($scope.categories, {parentId: value.id}).length === 0) {
                $scope.childCategories.push(value);
              }
            }
          });
        });
      }])

  .controller('EditProductCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'productRepository', 'categoryRepository', '$state', '$stateParams', '$filter', 'toastr', '_',
    function($scope, CQRS, DenormalizationService, productRepository, categoryRepository, $state, $stateParams, $filter, toastr,  _) {
      
      $scope.editing = true;

      var productId = $stateParams.id;
      var eventName = "productChanged";
      var commandName = "changeProduct";

      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName: eventName
      }, function (items, data) {
        toastr.success('Product Saved!', 'Product has been saved');
        $state.go('app.products.list', {}, {reload: true});
      });

      // Submit operation
      $scope.ok = function(form) {

        var x = 0;

        var sendCommand = function(filelink){
            $scope.product.images = angular.copy($scope.product.images); 
            CQRS.sendCommand({
              id:_.uniqueId('msg'),
              command: commandName,
              aggregate: { 
                name: $scope.aggregate
              },
              payload: $scope.product
            });
        };

        var cb = function(filelink){
          if(filelink)
          {
            $scope.product.images[x] = {
                src: filelink
            };
            x++;
          }

          if ($scope.product.images.length === x) {
            sendCommand();
          }
        };

        if (form.images.$modelValue[0] && form.images.$modelValue[0].lastModified && form.images.$valid) {
          $scope.uploadImages($scope.product.images, $scope.user, cb);
        } else {
          sendCommand();
        }

      };
      /////////////////////// *Submit operation

      var getProductPromise = productRepository.get({ id: productId }).$promise;
      getProductPromise
        .then(function (result) {

          $scope.product = result;
          return categoryRepository.query().$promise;
        }, function(){

          $state.go('app.products.list', {}, {reload: true});
        })
        .then(function (result) {

          $scope.categories = result.items;

          $scope.childCategories = [];
          //extend array
          angular.forEach($scope.categories, function (value, key) {
            if (value.parentId){
              var existingCategory = $filter('filter')($scope.categories, { id: value.parentId }, true)[0];
              if (existingCategory != null && existingCategory != undefined) {
                value.parentName = existingCategory.name;
                $scope.childCategories.push(value);
              }
            } else {
              if ($filter('filter')($scope.categories, {parentId: value.id}).length === 0) {
                $scope.childCategories.push(value);
              }
            }
          });
        });
    }])

  .controller('ShowProductCtrl', ['$scope', 'productRepository', 'categoryRepository', '$state',  '$stateParams', '$filter',
    function($scope, productRepository, categoryRepository, $state, $stateParams, $filter) {
    var productId = $stateParams.id;

    var getProductPromise = productRepository.get({ id: productId }).$promise;
    getProductPromise
      .then(function (result) {

        $scope.product = result;
        return categoryRepository.get({ id: $scope.product.categoryId }).$promise;
      }, function(){

        $state.go('app.products.list', {}, {reload: true});
      })
      .then(function (result) {

         $scope.product.category = result;
      });
    }]);
