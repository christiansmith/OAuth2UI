'use strict';

angular.module('OAuth2UI.controllers')
  .controller('DeveloperCtrl', function ($scope, $http) {
    $http.get('/v1/apps').then(function (response) {
      $scope.apps = response.data
    });
  })


