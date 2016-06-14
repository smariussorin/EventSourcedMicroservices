'use strict';
app.factory('Auth', ['$firebaseAuth', 'fbutil', function($firebaseAuth, fbutil) {
  return $firebaseAuth(fbutil.ref());
}]);


