'use strict';

app
  .directive('gallery', function () {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        var	defaults	= {},
            options		= angular.extend({}, defaults, scope.$eval(attrs.gallery));

        element.magnificPopup({
          delegate: options.selector,
          gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1]
          },
          image: {
            tError: 'Error: Unable to Load Image',
            titleSrc: function (item) {
              return item.el.attr('title');
            }
          },
          tLoading: 'Loading...',
          mainClass: 'mfp-img-mobile',
          type: 'image'
        });
      }
    };
  });
