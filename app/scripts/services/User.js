'use strict';

angular.module('OAuth2UI.services')
  .factory('User', function ($q, $http, $location) {

    /**
     * User constructor
     */

    function User () {}


    /**
     * Private state exposed via the constructor
     * for testing.
     */

    User.isAuthenticated = false;
    User.requiresAuthentication = false;


    /**
     * Set User.requiresAuthentication to true
     */

    User.prototype.requireAuthentication = function () {
      User.requiresAuthentication = true;
    };


    /**
     * Get User.requiresAuthentication
     *
     * This is useful for $watch, where values outside
     * scope require a function instead of a property name.
     */

    User.prototype.requiresAuthentication = function () {
      return User.requiresAuthentication;
    }


    /**
     * If no argument is provided, check if the user is
     * authenticated. If a user argument is provided,
     * "authenticate".
     */

    User.prototype.isAuthenticated = function(user) {
      if (user) {
        var key;
        for (key in user) { this[key] = user[key]; }
        User.isAuthenticated = true;
        User.requiresAuthentication = false;
        return User;
      } else {
        return User.isAuthenticated;
      }
    };


    /**
     * Register a new user
     */

    User.prototype.signup = function(registration) {
      var user = this;

      function success (response) {
        user.isAuthenticated(response.data.account);
      }

      return $http.post('/signup', registration).then(success);
    };


    /**
     * Login a user with password credentials
     */

    User.prototype.login = function(credentials) {
      var user = this;

      function success (response) {
        user.isAuthenticated(response.data.account);
      }

      return $http.post('/login', credentials).then(success);
    };


    /**
     * Reset the service to its initial state
     */

    User.prototype.reset = function() {
      var key;
      for (key in this) { delete this[key]; }
      User.isAuthenticated = false;
      User.requiresAuthentication = false;
    };


    /**
     * Log out an authenticated user
     */

    User.prototype.logout = function() {
      var user = this;

      function success (response) {
        user.reset();
        $location.path('/');
      }

      return $http.post('/logout').then(success);
    };


    /**
     * Check the user's session.
     *
     * This is useful to know if the user is authenticated
     * when the app first boots up.
     */

    User.prototype.session = function() {
      var deferred = $q.defer()
        , user     = this
        ;

      function success (response) {
        user.pinged = Date.now();
        if (response.data.authenticated) {
          user.isAuthenticated(response.data.account);
        }
        deferred.resolve(user);
      }

      $http.get('/session').then(success);

      return deferred.promise;
    };


    /**
     * Resolve session
     */

    User.prototype.resolveSession = function () {
      var promise;

      // get the session if it hasn't
      // yet been requested
      if (!this.pinged) {
        promise = this.session();
      }

      // otherwise wrap user in a promise
      else {
        var deferred = $q.defer();
        deferred.resolve(this);
        promise = deferred.promise;
      }

      return promise;
    };


    /**
     * Resolve authenticated
     */

    User.prototype.resolveAuthenticated = function () {
      var deferred = $q.defer()
        , user     = this
        ;

      // if the session has been checked and the
      // user is authenticated, resolve the promise
      if (user.pinged && user.isAuthenticated()) {
        deferred.resolve(User);
      }

      // otherwise, ping the session
      else {
        user.session().then(function () {
          // if the user is authenticated,
          // resolve the promise
          if (user.isAuthenticated()) {
            deferred.resolve(user);
          }

          // otherwise, navigate to the
          // signin view
          else {
            $location.path('/signin');
          }
        });
      }

      return deferred.promise;
    };


    /**
     * User apps
     */

    User.prototype.apps = function () {
      var deferred = $q.defer();

      function success (response) {
        deferred.resolve(response.data);
      }

      function failure (fault) {
        deferred.reject(fault);
      }

      $http.get('/session/apps').then(success, failure);
      return deferred.promise;
    };


    /**
     * Revoke access token
     */

    User.prototype.revoke = function (client_id) {
      var deferred = $q.defer();

      function success (response) {
        console.log('REVOKED', response);
        deferred.resolve(response);
      }

      function failure (fault) {
        console.log('FAILED REVOKE', fault);
        deferred.reject(fault);
      }

      $http.delete('/session/apps/' + client_id).then(success, failure);
      return deferred.promise;
    };


    /**
     * Return an instance of User
     */

    return new User();
  })

