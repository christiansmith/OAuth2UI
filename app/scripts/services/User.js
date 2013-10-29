'use strict';

angular.module('OAuth2UI.services')
  .factory('User', function ($http, $location) {

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
        user.isAuthenticated(response.data.user);
      }

      return $http.post('/signup', registration).then(success);
    };


    /**
     * Login a user with password credentials
     */

    User.prototype.login = function(credentials) {
      var user = this;

      function success (response) {
        user.isAuthenticated(response.data.user);
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
      var user = this;

      function success (response) {
        if (response.data.authenticated) {
          user.isAuthenticated(response.data.user);
        }
      }

      return $http.get('/session').then(success);
    };


    /**
     * Return an instance of User
     */

    return new User();
  })

