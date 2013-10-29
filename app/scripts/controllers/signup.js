'use strict';

angular.module('OAuth2UI.controllers')
  .controller('SignupCtrl', function ($scope, $location, User) {
    

    /**
     * Signup
     */

    $scope.signup = function () {

      function success () {
        $scope.reset();
        $location.path('/authorize');
      }
      
      function failure (fault) {
        $scope.message = fault.data.error;
      }

      User.signup($scope.registration).then(success, failure);
    }


    /**
     * Form reset
     */

    $scope.reset = function () {
      $scope.registration = {};
      $scope.message = '';
      $scope.messageType = '';      
    }


    /**
     * Initialize
     */

    $scope.reset();


  });