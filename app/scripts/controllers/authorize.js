'use strict';

angular.module('OAuth2UI.controllers')
  .controller('AuthorizeCtrl', function ($scope, $location, Flow, User) {

    $scope.authorization = Flow.params;
    $scope.client        = Flow.app;
    $scope.scope         = Flow.scope;
    $scope.user          = User;

    $scope.logout = function () {
      User.logout().then(function () {
        $location.path('/signin');
      });
    };
  })
