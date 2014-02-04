'use strict';

angular.module('OAuth2UI.services', [])

  .factory('Flow', function ($q, $route, $window, $location, $http, User) {

    return {


      authorizing: false,

      /**
       * Memorize initial query string
       */

      params: {},


      /**
       * Redirect
       */

      redirect: function (uri) {
        $window.location = uri;
      },


      /**
       * Hit /authorize endpoint on server
       */

      authorize: function () {
        var Flow = this
          , deferred = $q.defer()
          ;

        function success (response) {

          // we're already authorized
          // "redirect" to the client app
          if (response.data.redirect_uri) {
            Flow.redirect(response.data.redirect_uri);
          }

          // here's the descriptive data we need
          // to prompt the user to allow/deny
          else {
            Flow.app   = response.data.app;
            Flow.scope = response.data.scope;
            deferred.resolve(Flow);
          }

        }

        $http({
          method: 'GET',
          url: '/authorize',
          params: this.params,
          headers: {
            'Content-type': 'application/json'
          }
        }).then(success);

        return deferred.promise;
      },


      /**
       * Gaurd /authorize route
       */

      resolve: function () {
        var deferred = $q.defer()
          , Flow = this
          ;

        // authorizing
        this.authorizing = true;

        // stash route params
        angular.extend(this.params, $route.current.params);

        // remove query string
        $location.search({});

        // need session ping to be complete before
        // we continue
        User.session().then(function () {

          // ensure authenticated user
          if (!User.isAuthenticated()) {
            return $location.url('/signin');
          }

          // authorization details or redirect_uri
          // depending on if a token already exists
          Flow.authorize().then(function (flow) {
            deferred.resolve(flow);
          });
        });

        return deferred.promise;
      }

    }
  })
