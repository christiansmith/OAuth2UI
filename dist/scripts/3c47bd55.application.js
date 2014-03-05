'use strict';

angular.module('OAuth2UI', ['OAuth2UI.controllers', 'OAuth2UI.services', 'OAuth2UI.directives', 'ui.bootstrap', 'angular-md5'])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {

    /**
     * HTML5 mode
     */
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';


    /**
     * Register interceptors
     */

    //$httpProvider.interceptors.push('AuthenticationInterceptor');


    /**
     * Ensure session has been pinged
     */

    var resolveSession = ['User', function (User) {
      return User.resolveSession();
    }];

    var resolveAuthenticated = ['User', function (User) {
      return User.resolveAuthenticated();
    }];

    var resolveFlow = ['Flow', function (Flow) {
      return Flow.resolve();
    }];



    /**
     * Route definitions
     */

    $routeProvider
      .when('/authorize', {
        templateUrl: 'views/authorize.html',
        controller: 'AuthorizeCtrl',
        resolve: {
          Flow: resolveFlow,
        }
      })
      .when('/signin', {
        templateUrl: 'views/signin.html',
        controller: 'SigninCtrl'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl',
        resolve: {
          User: resolveAuthenticated
        }
      })
      .when('/account/apps', {
        templateUrl: 'views/apps.html',
        controller: 'AppsCtrl',
        resolve: {
          User: resolveAuthenticated,
          apps: ['User', function (User) {
            return User.apps();
          }]
        }
      })
      .when('/developer', {
        templateUrl: 'views/developer.html',
        controller: 'DeveloperCtrl'
      })
      .otherwise({
        redirectTo: '/signin'
      });
  })


'use strict';

angular.module('OAuth2UI.controllers', [])
  .controller('AccountCtrl', function ($scope, $location, User) {

    $scope.user = User;

    $scope.logout = function () {
      User.logout().then(function () {
        $location.path('/signin');
      });
    };

  })




'use strict';

angular.module('OAuth2UI.controllers')
  .controller('AppsCtrl', function ($scope, User, apps) {

    $scope.apps = apps;

    $scope.revoke = function (id) {
      User.revoke(id).then(function () {
        User.apps().then(function (data) {
          $scope.apps = data;
        });
      });
    };

  })



'use strict';

angular.module('OAuth2UI.controllers')
  .controller('AuthorizeCtrl', function ($scope, $location, Flow, User) {

    $scope.authorization = Flow.params;
    $scope.client        = Flow.app;
    $scope.scope         = Flow.scope;
    $scope.user          = User;

    $scope.logout = function () {
      User.logout().then(function () {
        $location.path('/signin');
      });
    };
  })

'use strict';

angular.module('OAuth2UI.controllers')
  .controller('DeveloperCtrl', function ($scope, $http) {
    $http.get('/v1/apps').then(function (response) {
      $scope.apps = response.data
    });
  })



'use strict';

angular.module('OAuth2UI.controllers')
  .controller('SigninCtrl', function ($scope, $location, User, Flow) {
    $scope.credentials = {};
    $scope.message = '';

    $scope.login = function () {
      function success (response) {
        console.log('SUCCESS', User);
        $location.path(Flow.authorizing ? '/authorize' : '/account');
      }

      function failure (fault) {
        console.log('FAILURE', fault.data);
        $scope.message = fault.data.error;
      }

      User.login($scope.credentials).then(success, failure);
    }

  })


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
        deferred.resolve(user);
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
