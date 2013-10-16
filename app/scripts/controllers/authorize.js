'use strict';

angular.module('OAuth2UI')
  .controller('AuthorizeCtrl', function ($scope, $location, User) {

    if (!User.isAuthenticated()) {
      $location.path('/signin')
    }

    $scope.user = User;

    $scope.logout = function () { 
      User.logout().then(function () { 
        $location.path('/signin') 
      }) 
    }

    $scope.scope = [
      'read and update your profile',
      'write your tweets',
      'tell the NSA'
    ];
  });
