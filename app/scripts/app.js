'use strict';

angular.module('OAuth2UI', [])
  .config(function ($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';

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
      .otherwise({
        redirectTo: '/signin'
      });
  });
