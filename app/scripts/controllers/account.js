'use strict';

angular.module('OAuth2UI.controllers', [])
  .controller('AccountCtrl', function ($scope, $location, User) {

    $scope.user = User;

    $scope.logout = function () {
      User.logout().then(function () {
        $location.path('/signin');
      });
    };

  })


