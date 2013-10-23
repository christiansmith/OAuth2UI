'use strict';

angular.module('OAuth2UI')
  .controller('AuthorizeCtrl', function ($scope, $window, $routeParams, $location, Authorization, User) {

    Authorization.setParams($routeParams);

    if (!User.isAuthenticated()) {
      $location.path('/signin')
    }

    function authDetailsSuccess (response) {
      console.log('RESPONSE', response)
      $scope.client = response.data.client;
      $scope.scope = response.data.scope;      
    }

    function authDetailsFailure (fault) {
      console.log('FAULT', fault)
    }
    
    Authorization.getDetails().then(authDetailsSuccess, authDetailsFailure);

    $scope.user = User;

    $scope.logout = function () { 
      User.logout().then(function () { 
        $location.path('/signin') 
      }) 
    }
  })
