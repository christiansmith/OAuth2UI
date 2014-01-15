'use strict';

angular.module('OAuth2UI.controllers')
  .controller('AccountCtrl', function ($scope, $location, User) {

    if (!User.isAuthenticated()) { $location.path('/signin'); }

    $scope.user = User;

  })


