angular.module('ngCQRS', []);
angular.module('ngCQRS')

/**
 * @ngdoc object
 * @name ngCQRS.provider:CQRSProvider
 * @kind function
 *
 * @description
 * Handles the configuration of the CQRS module.
 *
 */
  .provider('CQRS', function CQRS() {

    var urlFactory = function () {
        throw 'Please specify a urlFactory for CQRS queries. CQRSProvider.setUrlFactory(function (viewModelName) { .... }';
      },
      queryParserFunction = function (responseData) {
        return responseData;
      },
      eventParserFunction = function (responseData) {
        return responseData;
      },
      commandIdExtractionFunction = function (event) {
        return event.commandId;
      };

    function throwIfInvalidFunction(func) {
      if (typeof func !== 'function') {
        throw 'Please specify a valid function!';
      }
    }

    /**
     * @ngdoc object
     * @name ngCQRS.provider:CQRSProvider#setCommandIdExtractionFunction
     * @methodOf ngCQRS.provider:CQRSProvider
     * @kind function
     *
     * @description
     * Registers a function to extract the commandId from an incoming event.
     *
     * @param {function} commandIdFunction The comanndId extraction function.
     *  Angular.CQRS will pass in the received event (after parsing).
     */
    this.setCommandIdExtractionFunction = function (commandIdFunction) {
      throwIfInvalidFunction(commandIdFunction);
      commandIdExtractionFunction = commandIdFunction;
    };

    /**
     * @ngdoc object
     * @name ngCQRS.provider:CQRSProvider#setUrlFactory
     * @methodOf ngCQRS.provider:CQRSProvider
     * @kind function
     *
     * @description
     * Registers a url factory function that will be used to generate query URLs.
     *
     * @param {function} urlFactoryFunction The factory function.
     *  Angular.CQRS will pass in the viewModelName identifier and url parameters.
     */
    this.setUrlFactory = function (urlFactoryFunction) {
      throwIfInvalidFunction(urlFactoryFunction);
      urlFactory = urlFactoryFunction;
    };

    /**
     * @ngdoc object
     * @name ngCQRS.provider:CQRSProvider#setQueryParser
     * @methodOf ngCQRS.provider:CQRSProvider
     * @kind function
     *
     * @description
     * Registers a parse function that will be used to modify all returned query responses.
     * This is optional.
     *
     * @param {function} parserFunction The parser function to modify the query response. angular.CQRS will pass in the query response.
     */
    this.setQueryParser = function (parserFunction) {
      throwIfInvalidFunction(parserFunction);
      queryParserFunction = parserFunction;
    };

    /**
     * @ngdoc object
     * @name ngCQRS.provider:CQRSProvider#setQueryParser
     * @methodOf ngCQRS.provider:CQRSProvider
     * @kind function
     *
     * @description
     * Registers a parse function that will be used to modify all incoming events.
     * This is optional.
     *
     * @param {function} parserFunction The parser function to modify the event. angular.CQRS will pass in the event object.
     */
    this.setEventParser = function (parserFunction) {
      throwIfInvalidFunction(parserFunction);
      eventParserFunction = parserFunction;
    };

    /**
     * @ngdoc object
     * @name ngCQRS.provider:CQRSProvider#toUrlGETParameterString
     * @methodOf ngCQRS.provider:CQRSProvider
     * @kind function
     *
     * @description
     *  Generates a url parameter string in the form '?paramNameOne=paramOne&paramNameTwo=paramTwo'
     *
     *  @param {object} parameters The url parameters object
     */
    this.toUrlGETParameterString = function (parameters) {
      var buffer = [];
      angular.forEach(parameters, function (paramValue, paramName) {
        buffer.push(paramName + '=' + paramValue);
      });
      return '?' + buffer.join('&');
    };

    /**
     * @ngdoc service
     * @name ngCQRS.service:CQRS
     *
     * @description
     * Is used to send commands and define the specific channel over which messages will be sent.
     *
     * ### Usage
     *
     * In order to connect angular.CQRS to your websocket / long polling solution, wire up commands and events.
     *
     * ```javascript
     * var mySocket = io();
     *
     * // pass in events from your socket
     * mySocket.on('events', function (data) {
     *  CQRS.eventReceived(data);
     * });
     *
     * // pass commands to your socket
     * CQRS.onCommand(function (data) {
     *  mySocket.emit('commands', data);
     * });
     *  ```
     * To send Commands to the server:
     *
     * ```javascript
     * CQRS.sendCommand({
     *  command: 'changeProfile',
     *  aggregateType: 'profile',
     *  payload: {
     *    description: 'new Description',
     *    id: result.profile.id
     *  }
     * });
     *  ```
     */
    this.$get = function ($q, $rootScope, $http, ObjectId) {


      var commandCallbacks = {};
      var commandDeferreds = {};


      /**
       * Send a HTTP GET request to the backend.
       * Use specified 'urlFactory' function to build URL.
       * Note: generally you should use Store#for()
       */
      function query(viewModelName, parameters) {
        var deferred = $q.defer();
        $http.get(urlFactory(viewModelName, parameters))
          .success(function (data) {
            deferred.resolve(queryParserFunction(data));
          })
          .error(function (data, status) {
            deferred.reject({data: data, status: status});
          });
        return deferred.promise;
      }

      function augmentCommandObject(command) {
        if (angular.isUndefined(command.id)) {
          command.id = ObjectId().toString();
        }
        return command;
      }


      function storeCommandCallbackFunction(commandId, callbackFunction) {
        if (angular.isUndefined(callbackFunction)) {
          return;
        }

        if (typeof callbackFunction !== 'function') {
          throw 'Please specify a valid callback function...';
        }

        commandCallbacks[commandId] = callbackFunction;
      }

      function storeCommandDeferred(commandId, deferred) {
        commandDeferreds[commandId] = deferred;
      }

      function invokeCommandCallbackAndResolvePromise(event) {
        var commandId = commandIdExtractionFunction(event);
        var callback = commandCallbacks[commandId];
        if (angular.isDefined(callback)) {
          callback(event);
          commandCallbacks[commandId] = undefined;
        }

        var deferred = commandDeferreds[commandId];
        if (angular.isDefined(deferred)) {
          deferred.resolve(event);
          commandDeferreds[commandId] = undefined;
        }
      }

      /**
       * @ngdoc function
       * @name ngCQRS.service:CQRS#sendCommand
       * @methodOf ngCQRS.service:CQRS
       *
       * @description
       * Sends a command using the function registered by {@link ngCQRS.service:CQRS#onCommand onCommand}
       *
       * @param {object} commandObject The command object to send to the backend
       * @param {function} callbackFunction A optional callback function that is invoked once, as soon as the correspondant event returns from the server
       * @returns {*} Returns a promise object that will be resolved as soon as the correspondant event returns from the server (alternative to the callback function)
       */
      function sendCommand(commandObject, callbackFunction) {
        var augmentedCommandObject = augmentCommandObject(commandObject);

        $rootScope.$emit('CQRS:commands', augmentedCommandObject);

        storeCommandCallbackFunction(augmentedCommandObject.id, callbackFunction);
        var deferred = $q.defer();
        storeCommandDeferred(augmentedCommandObject.id, deferred);
        return deferred.promise;
      }

      /**
       * Used to register a onEvent method in {@link ngCQRS.service:StoreService StoreService}
       */
      function onEvent(listener) {
        $rootScope.$on('CQRS:events', function (angularEvent, data) {
          var event = eventParserFunction(data);
          invokeCommandCallbackAndResolvePromise(event);
          listener(event);
        });
      }

      /**
       * @ngdoc function
       * @name ngCQRS.service:CQRS#eventReceived
       * @methodOf ngCQRS.service:CQRS
       *
       * @description
       * Used to call Angular.CQRS from your application, i.e. if a specific websocket message arrived.
       *
       * @param {object} event The received event
       */
      function eventReceived(event) {
        $rootScope.$emit('CQRS:events', event);
      }

      /**
       * @ngdoc function
       * @name ngCQRS.service:CQRS#onCommand
       * @methodOf ngCQRS.service:CQRS
       *
       * @description
       * Used to register a channel over which Angular.CQRS commands will be sent, i.e. websocket connection
       *
       * @param {function} listener The function with which the command should be sent
       */
      function onCommand(listener) {
        $rootScope.$on('CQRS:commands', function (angularEvent, data) {
          listener(data);
        });
      }

      return {
        query: query,
        sendCommand: sendCommand,
        onEvent: onEvent,
        onCommand: onCommand,
        eventReceived: eventReceived
      };
    };

  });

angular.module('ngCQRS')

/**
 * @ngdoc service
 * @name ngCQRS.service:DenormalizationService
 *
 * @description
 * Used to configure denormalizers.
 *
 * ### Usage
 *
 *  ```javascript
 * DenormalizationService.registerDenormalizerFunction({
 *  viewModelName: 'profile',
 *  eventName: 'profileChanged'
 * }, function (oldData, payload) {
 *  return angular.extend(oldData, payload);
 * });
 *  ```
 *
 */
  .service('DenormalizationService', function DenormalizationService() {
    var denormalizerFunctions = {};

    /**
     * @ngdoc object
     * @name ngCQRS.service:DenormalizationService#getDenormalizerFunctions
     * @methodOf ngCQRS.service:DenormalizationService
     * @kind function
     *
     * @description
     * Returns the denormalization functions for the specified aggregateType/eventName pair.
     *
     * @param {string} eventName The event name
     * @param {string} aggregateType The aggregate type
     */
    function getDenormalizerFunctions(eventName, aggregateType) {
      if (angular.isUndefined(aggregateType)) {
        aggregateType = '_common';
      }
      if (angular.isUndefined(denormalizerFunctions[aggregateType])) {
        return {};
      }
      if (angular.isUndefined(denormalizerFunctions[aggregateType][eventName])) {
        return {};
      }
      return denormalizerFunctions[aggregateType][eventName];
    }

    /**
     * @ngdoc object
     * @kind function
     * @name ngCQRS.service:DenormalizationService#registerDenormalizerFunction
     * @methodOf ngCQRS.service:DenormalizationService
     *
     *
     * @description
     * Is used to register a denormalization function for incoming events. Can be used to merge the change delta into the existing dataset on the client.
     * You must register a denormalization function for every viewModel + eventName combination (aggregateType is optional) you want to handle.
     *
     * @param {object} config A configuration object that can contain:
     *
     *    Object properties:
     *
     *    - `viewModelName` – `{string}` – The name of the viewModel
     *    - `eventName` - `{string}` - The name of the event
     *    - `aggregateType` – `{string}` – An optional name of a aggregate type
     *
     * @param {function} denormalizerFunction The function used to merge (denormalized) event payload and original viewModelName data.
     *    Angular.CQRS will pass in the original viewModelName data and the event.
     *
     */
    function registerDenormalizerFunction(config, denormalizerFunction) {
      if (angular.isUndefined(config.aggregateType)) {
        // this is allowed. store all denormalizers without a specific aggregateType under '_common'
        config.aggregateType = '_common';
      }
      if (angular.isUndefined(denormalizerFunctions[config.aggregateType])) {
        denormalizerFunctions[config.aggregateType] = {};
      }
      if (angular.isUndefined(denormalizerFunctions[config.aggregateType][config.eventName])) {
        denormalizerFunctions[config.aggregateType][config.eventName] = {};
      }
      if (angular.isDefined(denormalizerFunctions[config.aggregateType][config.eventName][config.viewModelName])) {
        denormalizerFunctions[config.aggregateType][config.eventName][config.viewModelName] = {};
      }
      denormalizerFunctions[config.aggregateType][config.eventName][config.viewModelName] = denormalizerFunction;
    }

    return {
      getDenormalizerFunctions: getDenormalizerFunctions,
      registerDenormalizerFunction: registerDenormalizerFunction
    };
  });

angular.module('ngCQRS')

/**
 * @ngdoc service
 * @name ngCQRS.service:ObjectId
 *
 * @description
 *    Used to obtain a objectId that mimics how WCF serializes a object of type MongoDB.Bson.ObjectId
 *    and converts between that format and the standard 24 character representation.
 *    Inspired by https://github.com/justaprogrammer/ObjectId.js
 *
 * ### Usage
 *
 *  ```javascript
 * mymodule.service('MyService', function(ObjectId){
 *
 * var objectIdOne = ObjectId();
 * var objectIdTwo = ObjectId(0, 0, 0, 0x00ffffff);
 * var objectIdThree = ObjectId('507f1f77bcf86cd799439011');
 * console.log(objectIdOne.toArray());
 * console.log(objectIdThree.toArray());
 *
 * });
 *  ```
 *
 */
  .service('ObjectId', function ObjectId() {

    /**
     * taken from modernizr, see https://github.com/Modernizr/Modernizr/
     */
    function localStorageSupported() {
      var testString = 'tenac';
      try {
        window.localStorage.setItem(testString, testString);
        window.localStorage.removeItem(testString);
        return true;
      } catch (e) {
        return false;
      }
    }

    /*
     *
     * Copyright (c) 2011 Justin Dearing (zippy1981@gmail.com)
     * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
     * and GPL (http://www.opensource.org/licenses/gpl-license.php) version 2 licenses.
     * This software is not distributed under version 3 or later of the GPL.
     *
     * Version 1.0.1-dev
     *
     */

    var increment = 0;
    var pid = Math.floor(Math.random() * (32767));
    var machine = Math.floor(Math.random() * (16777216));

    if (localStorageSupported()) {
      var mongoMachineId = parseInt(window.localStorage.mongoMachineId);
      if (mongoMachineId >= 0 && mongoMachineId <= 16777215) {
        machine = Math.floor(window.localStorage.mongoMachineId);
      }
      // Just always stick the value in.
      window.localStorage.mongoMachineId = machine;
      window.document.cookie = 'mongoMachineId=' + machine + ';expires=Tue, 19 Jan 2038 05:00:00 GMT';
    } else {
      var cookieList = window.document.cookie.split('; ');
      for (var i in cookieList) {
        var cookie = cookieList[i].split('=');
        if (cookie[0] === 'mongoMachineId' && cookie[1] >= 0 && cookie[1] <= 16777215) {
          machine = cookie[1];
          break;
        }
      }
      window.document.cookie = 'mongoMachineId=' + machine + ';expires=Tue, 19 Jan 2038 05:00:00 GMT';
    }


    /**
     * @ngdoc object
     * @name ngCQRS.service:ObjectId#ObjectId
     * @methodOf ngCQRS.service:ObjectId
     * @kind function
     *
     * @param {number} timestamp Optional Unix timestamp
     * @param {number} machine Optional machine identifier
     * @param {number} pid Optional process id
     * @param {number} increment Optional increment
     */
    function ObjectId() {
      if (!(this instanceof ObjectId)) {
        return new ObjectId(arguments[0], arguments[1], arguments[2], arguments[3]);
      }
      if (typeof arguments[0] === 'string' && arguments[0].length === 24) {
        this.timestamp = Number('0x' + arguments[0].substr(0, 8));
        this.machine = Number('0x' + arguments[0].substr(8, 6));
        this.pid = Number('0x' + arguments[0].substr(14, 4));
        this.increment = Number('0x' + arguments[0].substr(18, 6));
      } else if (arguments.length === 4 && angular.isDefined(arguments[0]) && angular.isDefined(arguments[1]) && angular.isDefined(arguments[2]) && angular.isDefined(arguments[3])) {
        this.timestamp = arguments[0];
        this.machine = arguments[1];
        this.pid = arguments[2];
        this.increment = arguments[3];
      } else {
        this.timestamp = Math.floor(new Date().valueOf() / 1000);
        this.machine = machine;
        this.pid = pid;
        this.increment = increment++;
        if (increment > 0xffffff) {
          increment = 0;
        }
      }
    }

    ObjectId.prototype.getDate = function () {
      return new Date(this.timestamp * 1000);
    };

    /**
     * @ngdoc object
     * @name ngCQRS.service:ObjectId#toArray
     * @methodOf ngCQRS.service:ObjectId
     * @kind function
     *
     * @description Returns the ObjectId instance as byte array
     */
    ObjectId.prototype.toArray = function () {
      var strOid = this.toString();
      var array = [];
      var i;
      for (i = 0; i < 12; i++) {
        array[i] = parseInt(strOid.slice(i * 2, i * 2 + 2), 16);
      }
      return array;
    };

    /**
     * @ngdoc object
     * @name ngCQRS.service:ObjectId#toString
     * @methodOf ngCQRS.service:ObjectId
     * @kind function
     *
     * @description Returns the 24 character string representation
     */
    ObjectId.prototype.toString = function () {
      var timestamp = this.timestamp.toString(16);
      var machine = this.machine.toString(16);
      var pid = this.pid.toString(16);
      var increment = this.increment.toString(16);
      return '00000000'.substr(0, 8 - timestamp.length) + timestamp +
        '000000'.substr(0, 6 - machine.length) + machine +
        '0000'.substr(0, 4 - pid.length) + pid +
        '000000'.substr(0, 6 - increment.length) + increment;
    };

    return ObjectId;
  });

angular.module('ngCQRS')

/**
 * @ngdoc service
 * @name ngCQRS.service:StoreService
 *
 * @description
 * Used to obtain a {@link ngCQRS.service:Store Store} instance.
 */
  .service('StoreService', function StoreService($rootScope, $q, $filter, $timeout, CQRS, DenormalizationService) {

    var scopeCallbacks = {};

    function isValidDataModelUpdateEvent(evt) {
      return (angular.isDefined(evt.payload) && angular.isDefined(evt.name));
    }

    function onEventHandler(evt) {
      if (!isValidDataModelUpdateEvent(evt)) {
        return;
      }

      var denormalizerFunctions = DenormalizationService.getDenormalizerFunctions(evt.name, evt.aggregateType);
      angular.forEach(denormalizerFunctions, function (denormalizerFunction, viewModelName) {
        var scopeCallback = scopeCallbacks[viewModelName];
        if (angular.isDefined(scopeCallback)) {
          // invoke denormalizer function
          scopeCallback.data = denormalizerFunction(scopeCallback.data, evt);

          // invoke all handler callbacks (in controllers and services) with the denormalized data
          scopeCallback.callbacks.forEach(function (callback) {
            callback.callbackFunction(scopeCallback.data);
          });
        }
      });
      $rootScope.$apply();
    }

    // register for events and update our store with the new data
    CQRS.onEvent(onEventHandler);

    function throwErrorIfInvalidGetArguments(viewModelName, parameters, callback) {
      if (angular.isUndefined(parameters) || typeof parameters !== 'object') {
        throw 'Please provide a valid parameters object!';
      }
      if (angular.isUndefined(viewModelName) || typeof viewModelName !== 'string') {
        throw 'Please provide a valid model Name (string)!';
      }
      if (angular.isUndefined(callback) || typeof callback !== 'function') {
        throw 'Please provide a valid callback function!';
      }
    }

    function handleQueryResponse(queryResult, viewModelName, callback, scopeId) {
      if (angular.isDefined(scopeCallbacks[viewModelName])) {
        scopeCallbacks[viewModelName].callbacks.push({callbackFunction: callback, scopeId: scopeId});
        scopeCallbacks[viewModelName].data = queryResult;
      } else {
        scopeCallbacks[viewModelName] = {
          data: queryResult,
          callbacks: [
            {
              callbackFunction: callback,
              scopeId: scopeId
            }
          ]
        };
      }
      callback(queryResult);
    }

    function handleQueryResponseError(error, errorCallback) {
      errorCallback(error.data, error.status);
    }

    function removeCallbacksForScope(scope) {

      var orphanedStoreItems = [];

      angular.forEach(scopeCallbacks, function (callbackItem, viewName) {
        var cleanedCallbacks = $filter('filter')(callbackItem.callbacks, function (callback) {
          return (callback.scopeId !== scope.$id);
        });
        if (cleanedCallbacks.length < 1) {
          orphanedStoreItems.push(viewName);
        } else {
          callbackItem.callbacks = cleanedCallbacks;
        }
      });

      orphanedStoreItems.forEach(function (orphan) {
        delete scopeCallbacks[orphan];
      });
    }

    /**
     *  Queries the server for the required model. Will update given Scope on server events
     */
    function get(viewModelName, parameters, callback, errorCallback, scopeId) {
      throwErrorIfInvalidGetArguments(viewModelName, parameters, callback);
      var queryPromise = CQRS.query(viewModelName, parameters);
      queryPromise.then(function (data) {
        handleQueryResponse(data, viewModelName, callback, scopeId);
      }, function (error) {
        handleQueryResponseError(error, errorCallback);
      });
    }

    /**
     * @ngdoc service
     * @kind function
     * @name ngCQRS.service:Store
     *
     * @description
     *  The store allows for querying modelViews and registering for subsequent events on that viewModelName.
     *
     *  ### Usage
     *  In your angular controller, you can query a viewModel and keep getting updates on events:
     *
     *  ```javascript
     * var store = StoreService.createForController($scope);
     *
     * store.for('profile').do(function (personDetails) {
     *   $scope.personDetails = personDetails;
     * });
     *  ```
     *
     *  Make sure to register an appropriate denormalizer function (see {@link ngCQRS.service:DenormalizationService DenormalizationService})
     */
    var StoreObject = function (scopeId) {

      /**
       * @ngdoc function
       * @name ngCQRS.service:Store#for
       * @methodOf ngCQRS.service:Store
       *
       * @description
       *  Specify the a viewModelName and optional url parameters
       *
       *  @param {string} viewModelName The identifier of the viewModelName
       *  @param {object} parameters An optional object containing url parameters. This will be passed together with the viewModelName identifier into your {@link ngCQRS.provider:CQRSProvider#setUrlFactory urlFactory} function.
       */
      this.for = function (viewModelName, parameters) {
        this.viewModelName = viewModelName;
        this.parameters = parameters || {};
        return this;
      };

      /**
       * @ngdoc function
       * @name ngCQRS.service:Store#do
       * @methodOf ngCQRS.service:Store
       *
       * @description
       *  register a handler for events on the specified viewModelName
       *
       *  @param {function} callback Function that is called on first query response and on subsequent events.
       *    Angular.CQRS will pass in the denormalized object (See {@link ngCQRS.service:DenormalizationService#registerDenormalizerFunction registerDenormalizerFunction}).
       *
       *  @param {function} errorCallback Function that is called on a http error during the first query request.
       *    Angular.CQRS will pass in the received data and the http status code.
       */
      this.do = function (callback, errorCallback) {
        get(this.viewModelName, this.parameters, callback, errorCallback, scopeId);
      };
    };

    /**
     * @ngdoc function
     * @name ngCQRS.service:StoreService#createForController
     * @methodOf ngCQRS.service:StoreService
     *
     * @description
     * Creates a {@link ngCQRS.service:Store Store} for your controller.
     *
     *  @param {object} $scope The angular $scope of your controller.
     *  Used to correctly clean-up the store once your controller scope is destroyed.
     */
    function createForController($scope) {
      $scope.$on('$destroy', function (evt) {
        removeCallbacksForScope(evt.currentScope);
      });
      return new StoreObject($scope.$id);
    }

    /**
     * @ngdoc function
     * @name ngCQRS.service:StoreService#createForService
     * @methodOf ngCQRS.service:StoreService
     *
     * @description
     * Creates a {@link ngCQRS.service:Store Store} for your service.
     */
    function createForService() {
      return new StoreObject(undefined);
    }

    return {
      createForController: createForController,
      createForService: createForService
    };

  });
