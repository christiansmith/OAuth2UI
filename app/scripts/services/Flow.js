'use strict';

angular.module('OAuth2UI.services', [])

  .factory('Flow', function ($location, $http) {

    var params = {};

    return {

      destination: function () {
        return (Object.keys(params).length > 0) ? '/authorize' : '/account';
      },

      getDetails: function () {
        return $http({
          method: 'GET',
          url: '/authorize',
          params: params,
          headers: {
            'Content-type': 'application/json'
          }
        });
      },

      setParams: function (p) {
        Object.keys(p).forEach(function (key) {
          params[key] = p[key];
        });
        $location.url($location.path())
      },

      getParams: function () {
        return params;
      }

    }
  })
