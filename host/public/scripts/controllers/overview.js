'use strict';

app
.controller('OverviewCtrl', ['$scope', '$state', 'categoryRepository', 'productRepository', 'orderRepository', '$firebaseArray',  'FBURL', '$filter', 'uploadImage', 'user', 'toastr',
  function($scope, $state, categoryRepository, productRepository, orderRepository, $firebaseArray, FBURL, $filter, uploadImage, user, toastr) {

    $scope.page = {
      title: 'Overview'
    };
    var getCategoriesPromise = categoryRepository.query().$promise;
    getCategoriesPromise
      .then(function (result) {
        $scope.categories = result.items;
      });

    var getProductsPromise = productRepository.query().$promise;
    getProductsPromise
      .then(function (result) {
        $scope.products = result.items;
      });

    var getOrdersPromise = orderRepository.query().$promise;
    getOrdersPromise
      .then(function (result) {
        $scope.orders = result.items;

        $scope.ordersValue = 0;
        angular.forEach($scope.orders, function(val, key) {
          $scope.ordersValue += val.subTotal;
        });
      });

    // General Firebase variable
    var ref = new Firebase(FBURL);
    $scope.users = $firebaseArray(ref.child('users'));
    $scope.users.$loaded(function(){
      $scope.activeUsers = $filter('filter')($scope.users, {blocked: false});
    });
  }])

.controller('OrdersChartCtrl', ['$scope', 'orderRepository', '$filter', '_',
  function($scope, orderRepository,  $filter, _) {

    $scope.range = '7d';

    $scope.options = {
      scaleShowVerticalLines: false,
      barValueSpacing : 20
    };

    function fetchOrders(){
       var getOrdersPromise = orderRepository.query().$promise;
      getOrdersPromise
        .then(function (result) {
          $scope.orders = $filter('orderBy')(result.items, 'createdAt');

          var lastOrder = _.last($scope.orders);
          if(lastOrder)
          {
            var lastDate = moment(lastOrder.createdAt).startOf('day').format('x');
            var x;
            var dayDuration = 86400000;

            $scope.chart = {
              labels : [],
              datasets : [
              {
                fillColor : "#f1c40f",
                strokeColor : "rgba(0,0,0,0)",
                data : []
              }
              ]
            };
            $scope.options.tooltipTemplate = "<%if (label){%><%=label%>: <%}%> $<%= value %>";

            if ($scope.range === '7d') {
              x = 7;
              lastDate -= 6*dayDuration;
            } else if ($scope.range === '31d') {
              x = 31;
              lastDate -= 30*dayDuration;
            }

            for(var i = 0; i < x; i++) {
              $scope.chart.labels.push($filter('date')(lastDate, 'dd MMM'));
              lastDate += dayDuration;
            }

            angular.forEach($scope.chart.labels, function(date){
              var dayValue = 0;
              angular.forEach($scope.orders, function(order){
                var orderDate = $filter('date')(order.createdAt, 'dd MMM');
                if (orderDate === date) {
                  dayValue += order.subTotal;
                }
              });
              $scope.chart.datasets[0].data.push(dayValue);
            });
          }
        });
    }
    
    fetchOrders();

    $scope.$watch('range', function(newVal, oldVal){
      if (newVal !== oldVal){

        if (newVal === '7d') {
          $scope.options.barValueSpacing = 20;
        }

        if (newVal === '31d') {
          $scope.options.barValueSpacing = 5;
        }

        fetchOrders();

      }
    });

  }
  ])

.controller('ProductsChartCtrl', ['$scope', 'categoryRepository', 'productRepository',  '$filter', 
  function($scope, categoryRepository, productRepository, $filter) {

    $scope.chart = [];

    var generateColor = function(){
       var r = (Math.round(Math.random()* 127) + 127).toString(16);
       var g = (Math.round(Math.random()* 127) + 127).toString(16);
       var b = (Math.round(Math.random()* 127) + 127).toString(16);
       return '#' + r + g + b;
    }
    
    function shadeColor(color, percent) {
        var R = parseInt(color.substring(1,3),16);
        var G = parseInt(color.substring(3,5),16);
        var B = parseInt(color.substring(5,7),16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;  
        G = (G<255)?G:255;  
        B = (B<255)?B:255;  

        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

        return "#"+RR+GG+BB;
    }

    var getCategoriesPromise = categoryRepository.query().$promise;
    getCategoriesPromise
    .then(function (result) {
      $scope.categories= result.items;

      return productRepository.query().$promise;
    })
    .then(function (result) {

      $scope.products = result.items;

      var parentCategories = $filter('filter')($scope.categories, {parent: true});
      var childCategories = $filter('filter')($scope.categories, {parent: false});

      angular.forEach(parentCategories, function(val, key){
        var quantity = 0;

        angular.forEach(childCategories, function(category){
          var x = 0;
          angular.forEach($scope.products, function(product){
            if (product.categoryId === category.id) {
              x++;
            }
          });
          if (category.parentId === val.id && x > 0) {
            quantity++;
          }
        });

        $scope.chart[key] = {};
        $scope.chart[key].color = generateColor();
        $scope.chart[key].highlight = shadeColor($scope.chart[key].color, -15);
        $scope.chart[key].label = val.name;
        $scope.chart[key].value = quantity;
      });

    });
  }]);
