'use strict';

app

  .controller('UsersCtrl', ['$scope', '$state', '$stateParams', '$firebaseArray', '$firebaseObject', 'FBURL', 'currentUser',
    function($scope, $state, $stateParams, $firebaseArray, $firebaseObject, FBURL, currentUser) {

      // General database variable
      var ref = new Firebase(FBURL);
      $scope.users = $firebaseArray(ref.child('users'));
      $scope.userObject = $firebaseObject(ref.child('users'));
      $scope.blockedUsers = ref.child('blockedUsers');
      //////////////////////////// *General database variable

      // get the model
      if($stateParams.id) {
        var id = $stateParams.id;
        $scope.user = $firebaseObject(ref.child('users').child(id));
      } else {
        $scope.user = {
          changeEmail: true,
          changePass: true
        };
      }

      if (currentUser.role === 'admin'){
        $scope.roles = {
          admin: "admin",
          superuser: "superuser",
          user: "user"
        };
      } else {
        $scope.roles = {
          superuser: "superuser",
          user: "user"
        };
      }

    }])

  .controller('UsersListCtrl', ['$scope', '$filter', 'ngTableParams', 'toastr', 'FBURL',
    function($scope, $filter, ngTableParams, toastr, FBURL) {

      var ref = new Firebase(FBURL);

      // Delete CRUD operation
      $scope.delete = function (user) {
        if (confirm('Are you sure?')) {
          $scope.users.$ref().child(user.$id).child('blocked').set(true);
          $scope.blockedUsers.child(user.$id).set({blocked: true});
          $scope.tableParams.reload();

          toastr.success('User Removed!', 'User has been removed');
        }
      };
      //////////////////////////// *Delete CRUD operation

      // password reset operation
      $scope.passReset = function (user) {
        if (confirm('Are you sure?')) {
          ref.resetPassword({
            email: user.email
          }, function (error) {
            if (error === null) {
              console.log("Password reset email sent successfully");
            } else {
              console.log("Error sending password reset email:", error);
            }
          });
        }
      };
      //////////////////////////// *password reset operation

      //////////////////////////////////////////
      //************ Table Settings **********//
      //////////////////////////////////////////

      // Initialize table
      $scope.users.$loaded().then(function() {

        // watch data in scope, if change reload table
        $scope.$watchCollection('users', function(newVal, oldVal){
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
            name: 'asc'     // initial sorting
          }
        }, {
          total: $scope.users.length, // length of data
          getData: function($defer, params) {
            // use build-in angular filter
            var orderedData = params.sorting() ?
              $filter('orderBy')($scope.users, params.orderBy()) :
              $scope.users;

            orderedData	= $filter('filter')(orderedData, {blocked: false});
            orderedData	= $filter('filter')(orderedData, $scope.searchText);
            params.total(orderedData.length);

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
        });
      });
      ////////////////////////////////////////// *Initialize table

    }])

  .controller('NewUserCtrl', ['$scope', 'toastr', '$state', 'FBURL', '$filter', 'Auth',
    function($scope, toastr, $state, FBURL, $filter, Auth) {

      var ref = new Firebase(FBURL);
      var profiles = ref.child('users');

      $scope.editing = false;

      // Submit operation
      $scope.ok = function() {

        $scope.userEntry = {
          name: $scope.user.name,
          email: $scope.user.email,
          role: $scope.user.role,
          phone: $scope.user.phone,
          blocked: false
        };

        if( $scope.user.address){
            $scope.user.address = {
              street: $scope.user.address.street,
              city: $scope.user.address.city,
              zip: $scope.user.address.zip,
              country: $scope.user.address.country
            };
        }

        Auth.$createUser({email: $scope.user.email, password: $scope.user.password})
          .then(function(userData) {
            // create a user profile in our data store
            profiles.child(userData.uid).set($scope.userEntry);

            console.log("Successfully created user account with uid:", userData.uid);
            toastr.success('User has been created', 'User Added!');
            $state.go('app.users.list', {}, {reload: true});
          }, function(error) {
            console.log("Error creating user:", error);
            toastr.error(error.message, 'Adding User Error!');
          });
      };
      /////////////////////// *Submit operation

    }])

  .controller('EditUserCtrl', ['$scope', '$firebaseObject', 'toastr', '$state', 'FBURL', '$filter',
    function($scope, $firebaseObject, toastr, $state, FBURL, $filter) {

      $scope.editing = true;

      var ref = new Firebase(FBURL);
      var profiles = ref.child('users');

      $scope.user.$loaded().then(function(){
        $scope.oldEmail = angular.copy($scope.user.email);
      });

      $scope.users.$loaded(function(){

        // Submit operation
        $scope.ok = function() {

          $scope.userEntry = {
            name: $scope.user.name,
            email: $scope.user.email,
            role: $scope.user.role,
            phone: $scope.user.phone
          };

          if( $scope.user.address){
            $scope.user.address = {
              street: $scope.user.address.street,
              city: $scope.user.address.city,
              zip: $scope.user.address.zip,
              country: $scope.user.address.country
            };
          }

          $scope.credentials = {
            password: $scope.user.password,
            oldpassword: $scope.user.oldpassword
          };

          var updateOnSuccess = function() {
            profiles.child($scope.user.$id).update($scope.userEntry, function() {
              toastr.success('User has been saved', 'User Saved!');
              $state.go('app.users.list', {}, {reload: true});
            });
          };

          var changeEmail = $scope.user.changeEmail;
          var changePass = $scope.user.changePass;

          if (changeEmail === true) {
            ref.changeEmail({
              oldEmail : $scope.oldEmail,
              newEmail : $scope.user.email,
              password : $scope.credentials.password
            }, function(error) {
              if (error === null) {
                console.log("Email changed successfully");
                toastr.success('Email has been changed successfully', 'Email changed!');
                updateOnSuccess();
              } else {
                toastr.error(error.message, 'Email change error!');
                console.log("Error changing email:", error);
              }
            });
          } else if (changePass === true) {
            ref.changePassword({
              email       : $scope.user.email,
              oldPassword : $scope.credentials.oldpassword,
              newPassword : $scope.credentials.password
            }, function(error) {
              if (error === null) {
                console.log("Password changed successfully");
                toastr.success('Password has been changed successfully', 'Password changed!');
                updateOnSuccess();
              } else {
                toastr.error(error.message, 'Password change error!');
                console.log("Error changing password:", error);
              }
            });
          } else {
            updateOnSuccess();
          }
        };
        /////////////////////// *Submit operation
      });


    }])

  .controller('ShowUserCtrl', ['$scope', '$firebaseObject', 'toastr', '$state', 'FBURL', '$stateParams',
    function($scope, $firebaseObject, toastr, $state, FBURL, $stateParams) {


    }]);
