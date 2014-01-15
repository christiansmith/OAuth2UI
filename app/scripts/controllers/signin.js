'use strict';

angular.module('OAuth2UI.controllers')
  .controller('SigninCtrl', function ($scope, $location, User, Authorization) {
    $scope.credentials = {};
    $scope.message = '';

    $scope.login = function () {
      function success (response) {
        console.log('SUCCESS', User);
        var target = (Authorization.getParams())
                   ? '/authorize'
                   : '/account';
        $location.path(target);
      }

      function failure (fault) {
        console.log('FAILURE', fault.data);
        $scope.message = fault.data.error;
      }

      User.login($scope.credentials).then(success, failure);
    }

  })

