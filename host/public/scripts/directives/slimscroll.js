'use strict';

/**
 * @ngdoc directive
 * @name emissApp.directive:slimScroll
 * @description
 * # slimScroll
 */
app
  .directive('slimscroll', function () {
    return {
      restrict: 'A',
      link: function($scope, $el, $attr) {

        var option = {};
        var refresh = function() {
          if ($attr.slimscroll) {
            option = $scope.$eval($attr.slimscroll);
          } else if ($attr.slimscrollOption) {
            option = $scope.$eval($attr.slimscrollOption);
          }
          $el.slimscroll({ destroy: true });
          $el.slimscroll(option);
        };

        refresh();

        var collapseBtn = angular.element('.sidebar-collapse'),
            $window = angular.element(window),
            sidebar = angular.element('#sidebar');

        var checkScrollbar = function() {
          refresh();
          if (!angular.element('#sidebar .slimScrollBar').is(':visible')) {
            sidebar.addClass('scroll-inactive');
          } else {
            sidebar.removeClass('scroll-inactive');
          }
        };

        collapseBtn.on('click', function(){
          checkScrollbar();
        });

        $window.resize(function() {
          checkScrollbar();
        });

        if ($attr.slimscroll && !option.noWatch) {
          $scope.$watchCollection($attr.slimscroll, refresh);
        }

        if ($attr.slimscrollWatch) {
          $scope.$watchCollection($attr.slimscrollWatch, refresh);
        }

        if ($attr.slimssrollListenTo) {
          $scope.on($attr.slimscrollListenTo, refresh);
        }
      }
    };
  });
