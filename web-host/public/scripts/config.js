'use strict';


app
  // your Firebase data URL goes here, no trailing slash
  .constant('FBURL', 'https://incandescent-fire-9501.firebaseio.com/')

  // where to redirect users if they need to authenticate (see routeSecurity.js)
  .constant('loginRedirectPath', 'core.login')

  // main app settings
  .controller('MainCtrl', ['$scope', 'fbutil', 'Auth', '$state', 'loginRedirectPath', '$firebaseObject', 
    function($scope, fbutil, Auth, $state, loginRedirectPath, $firebaseObject) {

    $scope.main = {
      title: 'EMISS',
      appName: 'emissApp',
      settings: {
        navbarHeaderColor: 'scheme-black',
        sidebarColor: 'scheme-black',
        brandingColor: 'scheme-black',
        activeColor: 'black-scheme-color',
        headerFixed: true,
        asideFixed: true,
        rightbarShow: false
      }
    };

    Auth.$onAuth(function(user) {
      if(user) {
        var unbind;
        // create a 3-way binding with the user profile object in Firebase
        var profile = $firebaseObject(fbutil.ref('users', user.uid));
        profile.$bindTo($scope, 'profile').then(function(ub) { unbind = ub; });

        $scope.logout = function() {
          if( unbind ) { unbind(); }
          profile.$destroy();
          Auth.$unauth();
          $state.go(loginRedirectPath, {}, {reload: true});
        };
      }
    });
  }]);
