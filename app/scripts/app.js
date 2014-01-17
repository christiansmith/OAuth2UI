'use strict';

angular.module('OAuth2UI', ['OAuth2UI.controllers', 'OAuth2UI.services'])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';
    $httpProvider.interceptors.push('AuthenticationInterceptor');

    $routeProvider
      .when('/authorize', {
        templateUrl: 'views/authorize.html',
        controller: 'AuthorizeCtrl'
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
        controller: 'AccountCtrl'
      })
      .when('/account/apps', {
        templateUrl: 'views/apps.html',
        controller: 'AppsCtrl'
      })
      .otherwise({
        redirectTo: '/signin'
      });
  })

  .run(function (User) {
    User.session()
  })
