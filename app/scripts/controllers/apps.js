
'use strict';

angular.module('OAuth2UI.controllers')
  .controller('AppsCtrl', function ($scope, $location, User) {

    if (!User.isAuthenticated()) { $location.path('/signin'); }

    User.apps().then(function (data) {
      $scope.apps = data;
      console.log('SCOPE APPS', $scope.apps);
    });

    $scope.revoke = function (id) {
      User.revoke(id).then(function () {
        User.apps().then(function (data) {
          $scope.apps = data;
        });
      });
    };

  })


