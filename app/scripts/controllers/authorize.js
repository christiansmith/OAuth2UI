'use strict';

angular.module('OAuth2UI')
  .controller('AuthorizeCtrl', function ($scope) {
    $scope.scope = [
      'read and update your profile',
      'write your tweets',
      'tell the NSA'
    ];
  });
