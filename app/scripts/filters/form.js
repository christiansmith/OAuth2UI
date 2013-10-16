'use strict';

angular.module('OAuth2UI')

  .filter('controlError', function () {
    return function (input) {
      if (input.$dirty && input.$invalid) { return 'error'; }
      //if (input.$pristine && input.$invalid) { return 'warning'; }
      return '';
    }
  })

  .filter('isComplete', function () {
    return function (input) {
      return (input.$dirty && input.$valid) ? true : false
    };
  })