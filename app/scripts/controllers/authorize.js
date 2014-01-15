'use strict';

angular.module('OAuth2UI.controllers', [])
  .controller('AuthorizeCtrl', function ($scope, $routeParams, $location, Flow, User) {

    Flow.setParams($routeParams);

    if (!User.isAuthenticated()) {
      $location.path('/signin')
    }

    $scope.authorization = Flow.getParams();

    function authDetailsSuccess (response) {
      console.log('RESPONSE', response)
      $scope.client = response.data.app;
      $scope.scope = response.data.scope;
    }

    function authDetailsFailure (fault) {
      console.log('FAULT', fault)
    }

    Flow.getDetails().then(authDetailsSuccess, authDetailsFailure);

    $scope.user = User;

    $scope.logout = function () {
      User.logout().then(function () {
        $location.path('/signin');
      });
    };
  })
