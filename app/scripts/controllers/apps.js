
'use strict';

angular.module('OAuth2UI.controllers')
  .controller('AppsCtrl', function ($scope, User, apps) {

    $scope.apps = apps;

    $scope.revoke = function (id) {
      User.revoke(id).then(function () {
        User.apps().then(function (data) {
          $scope.apps = data;
        });
      });
    };

  })


