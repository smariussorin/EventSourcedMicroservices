'use strict';

app.
  controller('ProfileCtrl', ['$scope', 'FBURL', '$firebaseObject', 'currentUser', 'user', 'toastr', 'uploadImage', function ($scope, FBURL, $firebaseObject, currentUser, user, toastr, uploadImage){


    // General database variable
    var ref = new Firebase(FBURL);
    var profiles = ref.child('users');
    //////////////////////////// *General database variable

    // Initial model
    $scope.user = $firebaseObject(ref.child('users').child(user.uid));
    /////////////////////// *Initial model

    $scope.user.$loaded().then(function(){

      $scope.uploadImage = function (file, user, cb) {
        uploadImage.uploadToS3(file, user, cb);
      };

      $scope.oldEmail = angular.copy($scope.user.email);

    });

    $scope.user.changeEmail = false;
    $scope.user.changePass = false;

    // Submit operation
    $scope.saveUser = function(form) {

      $scope.userEntry = {
        avatar: $scope.user.avatar,
        name: $scope.user.name,
        email: $scope.user.email,
        role: $scope.user.role,
        address: {
          street: $scope.user.address.street,
          city: $scope.user.address.city,
          zip: $scope.user.address.zip,
          country: $scope.user.address.country
        },
        phone: $scope.user.phone
      };

      $scope.credentials = {
        password: $scope.user.password,
        oldpassword: $scope.user.oldpassword
      };

      var updateOnSuccess = function() {

        function save(){
          profiles.child($scope.user.$id).update($scope.userEntry);
          toastr.success('Your Personal Informations has been updated', 'Saving success!');

          $scope.user.changeEmail = false;
          $scope.user.changePass = false;
        }

        var cb = function(filelink){
          $scope.userEntry.avatar = filelink;
          save();
        };

        if (form.avatar.$modelValue && form.avatar.$modelValue.lastModified && form.avatar.$valid) {
          $scope.uploadImage($scope.userEntry.avatar, user, cb);
        } else {
          save();
        }

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

  }]);

