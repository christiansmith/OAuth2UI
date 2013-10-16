'use strict';

angular.module('OAuth2UI')

  .factory('AuthenticationInterceptor', function ($q, $injector) {

    var $location;

    return {

      /**
       * Handle 401 Response
       */

      responseError: function (rejection) {
        $location = $location || $injector.get('$location');

        if (rejection.status === 401) {
          $location.path('/signin');
        } 

        return $q.reject(rejection);
      }

    };

  });