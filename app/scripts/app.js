'use strict';

angular.module('OAuth2UI', ['OAuth2UI.controllers', 'OAuth2UI.services'])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {

    /**
     * HTML5 mode
     */
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';


    /**
     * Register interceptors
     */

    $httpProvider.interceptors.push('AuthenticationInterceptor');


    /**
     * Ensure session has been pinged
     */

    var ensureSession = ['$q', '$rootScope', 'User', function ($q, $rootScope, User) {
      var deferred = $q.defer();

      if ($rootScope.session) {
        deferred.resolve(User);
      } else {
        User.session().then(function () {
          $rootScope.session = true;
          deferred.resolve(User);
        })
      }

      return deferred.promise;
    }]


    /**
     * Route definitions
     */

    $routeProvider
      .when('/authorize', {
        templateUrl: 'views/authorize.html',
        controller: 'AuthorizeCtrl',
        resolve: {
          User: ensureSession
        }
      })
      .when('/signin', {
        templateUrl: 'views/signin.html',
        controller: 'SigninCtrl'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl',
        resolve: {
          User: ensureSession
        }
      })
      .when('/account/apps', {
        templateUrl: 'views/apps.html',
        controller: 'AppsCtrl',
        resolve: {
          User: ensureSession
        }
      })
      .otherwise({
        redirectTo: '/signin'
      });
  })

