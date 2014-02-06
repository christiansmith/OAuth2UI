'use strict';

angular.module('OAuth2UI.directives', [])
  .directive('userMenu', function ($location, User) {
    return {
      restrict: 'E',
      templateUrl: 'views/userMenu.html',
      link: function (scope, element, attrs) {
        scope.user = User;
        scope.signout = function () {
          return User.logout().then(function () {
            $location.path('/signin');
          });
        };
      }
    };
  })
