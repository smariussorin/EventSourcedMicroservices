'use strict';

/**
 * @ngdoc function
 * @name jitApp.controller:PagesForgotPasswordCtrl
 * @description
 * # PagesForgotPasswordCtrl
 * Controller of the jitApp
 */
app
  .controller('ForgotPasswordCtrl', ['$scope', '$firebase', 'FBURL', '$state', 'toastr', function ($scope, $firebase, FBURL, $state, toastr){
    var ref = new Firebase(FBURL);

    $scope.email = null;

    $scope.ok = function(){
      ref.resetPassword({
        email: $scope.email
      }, function(error) {
        if (error === null) {
          console.log("Password reset email sent successfully");
          toastr.success('Your password has been reseted, check your email', 'Password reset!');
          $state.go('core.login', {}, {reload: true});
        } else {
          console.log("Error sending password reset email:", error);
          toastr.error(error.code, 'Reset Error!');
        }
      });
    };


  }]);
