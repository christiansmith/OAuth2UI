'use strict';

angular.module('OAuth2UI')

  .factory('AuthenticationInterceptor', function ($q, $injector) {

    var $window, $location;

    return {

      response: function (response) {
        $window = $window || $injector.get('$window');

        //console.log('intercepted', response);
        if (response.status === 302) {
          console.log('302 is true')
          $window.location = response.headers.location;
        }

        return response || $q.when(response);
      },

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
