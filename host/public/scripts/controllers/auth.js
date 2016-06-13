'use strict';

app.controller('AuthCtrl', ['$scope', 'Auth', '$state', 'fbutil', 'FBURL', '$firebaseArray', 'toastr', function($scope, Auth, $state, fbutil, FBURL, $firebaseArray, toastr) {

  //redirect if user is logged in
  if ($scope.loggedIn) {
     $state.go('app.overview', {}, {reload: true});
  }

  $scope.email = null;
  $scope.pass = null;
  $scope.confirm = null;
  $scope.createMode = false;
  $scope.rememberMe = true;

  $scope.login = function(email, pass, rememberMe) {
    $scope.err = null;
    Auth.$authWithPassword({ email: email, password: pass }, {rememberMe: rememberMe})
      .then(function(authData) {
        console.log("Authenticated successfully with payload:", authData);
        $state.go('app.overview', {}, {reload: true});
      }, function(err) {
        $scope.err = errMessage(err);
        console.log("Login Failed!", err);
      });
  };

  $scope.register = function() {
    $scope.err = null;
    if( assertValidAccountProps() ) {
      var email = $scope.email;
      var pass = $scope.pass;
      // create user credentials in Firebase auth system
      Auth.$createUser({email: email, password: pass})
        .then(function() {
          // authenticate so we have permission to write to Firebase
          return Auth.$authWithPassword({ email: email, password: pass });
        })
        .then(function(user) {

          // create a user profile in our data store
          var ref = fbutil.ref('users', user.uid);
          fbutil.handler(function(cb) {
            ref.update({email: email, role: "user"}, cb);
          });

        })
        .then(function(/* user */) {
          $state.go('app.overview', {}, {reload: true});
        }, function(err) {
          $scope.err = errMessage(err);
        });
    }
  };

  function assertValidAccountProps() {
    if( !$scope.email ) {
      $scope.err = 'Please enter an email address';
    }
    else if( !$scope.pass || !$scope.confirm ) {
      $scope.err = 'Please enter a password';
    }
    else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
      $scope.err = 'Passwords do not match';
    }
    return !$scope.err;
  }

  function errMessage(err) {
    return angular.isObject(err) && err.code? err.code : err + '';
  }
}]);
