'use strict';

angular.module('OAuth2UI.controllers')
  .controller('SigninCtrl', function ($scope, $location, User, Flow) {
    $scope.credentials = {};
    $scope.message = '';

    $scope.login = function () {
      function success (response) {
        console.log('SUCCESS', User);
        $location.path(Flow.destination());
      }

      function failure (fault) {
        console.log('FAILURE', fault.data);
        $scope.message = fault.data.error;
      }

      User.login($scope.credentials).then(success, failure);
    }

  })

