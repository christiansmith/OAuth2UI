'use strict';

angular.module('OAuth2UI.services', [])

  .factory('Authorization', function ($location, $http) {

    var params = {};

    return {

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

      hasParams: function () {
        return Boolean(Object.keys(params).length)
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
