'use strict';

/**
 * A directive that shows elements only when user is logged out.
 */
app.directive('ngHideAuth', ['Auth', '$timeout', function (Auth, $timeout) {
  var isLoggedIn;
  Auth.watch(function(user) {
    isLoggedIn = !!user;
  });

  return {
    restrict: 'A',
    link: function(scope, el) {
      function update() {
        el.addClass('ng-cloak'); // hide until we process it

        // sometimes if ngCloak exists on same element, they argue, so make sure that
        // this one always runs last for reliability
        $timeout(function () {
          el.toggleClass('ng-cloak', isLoggedIn !== false);
        }, 0);
      }

      update();
      Auth.watch(update, scope);
    }
  };
}]);
