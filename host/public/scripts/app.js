'use strict';

/* global app:true */
/* exported app */

var app = angular
  .module('emissApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'ui.router',
    'ui.bootstrap',
    'ngTable',
    'ui.utils',
    'toastr',
    'localytics.directives',
    'ngFileUpload',
    'slick',
    'angles',
    'ngCQRS',
    'btford.socket-io',
    'underscore'
  ]);

  app.run(['$rootScope', 'StoreService' ,'CQRS', 'socket', 'Auth', function($rootScope, StoreService, CQRS, socket, Auth) {
    var store = StoreService.createForController($rootScope);

    // pass in events from your socket
    socket.on('events', function(evt) {
      var evt = {
        aggregateType: evt.aggregate.name, 
        name: evt.event, payload: 
        evt.payload
      };
      CQRS.eventReceived(evt);
    });

    // pass commands to your socket
    CQRS.onCommand(function (data) {
      socket.emit('commands', data);
    });

    // track status of authentication
    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;
    });

  }]);

  app.factory('socket', function (socketFactory) {
    return socketFactory({
      ioSocket: io.connect('http://localhost:3000')
    });
  });

  app.config(function (CQRSProvider) { 
    CQRSProvider.setUrlFactory(function (viewModelName, parameters) {
     return 'http://localhost:3000/api/' + viewModelName + CQRSProvider.toUrlGETParameterString(parameters);
    });
  });