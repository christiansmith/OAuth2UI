'use strict';

angular.module('OAuth2UI', ['OAuth2UI.controllers', 'OAuth2UI.services', 'OAuth2UI.directives', 'ui.bootstrap', 'angular-md5'])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {

    /**
     * HTML5 mode
     */
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';


    /**
     * Register interceptors
     */

    //$httpProvider.interceptors.push('AuthenticationInterceptor');


    /**
     * Ensure session has been pinged
     */

    var resolveSession = ['User', function (User) {
      return User.resolveSession();
    }];

    var resolveAuthenticated = ['User', function (User) {
      return User.resolveAuthenticated();
    }];

    var resolveFlow = ['Flow', function (Flow) {
      return Flow.resolve();
    }];



    /**
     * Route definitions
     */

    $routeProvider
      .when('/authorize', {
        templateUrl: 'views/authorize.html',
        controller: 'AuthorizeCtrl',
        resolve: {
          Flow: resolveFlow,
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
          User: resolveAuthenticated
        }
      })
      .when('/account/apps', {
        templateUrl: 'views/apps.html',
        controller: 'AppsCtrl',
        resolve: {
          User: resolveAuthenticated,
          apps: ['User', function (User) {
            return User.apps();
          }]
        }
      })
      .when('/developer', {
        templateUrl: 'views/developer.html',
        controller: 'DeveloperCtrl'
      })
      .otherwise({
        redirectTo: '/signin'
      });
  })

