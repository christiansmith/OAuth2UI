'use strict';

angular.module('OAuth2UI', ['OAuth2UI.controllers', 'OAuth2UI.services'])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';
    $httpProvider.interceptors.push('AuthenticationInterceptor');

    $routeProvider
      .when('/authorize', {
        templateUrl: 'views/authorize.html',
        controller: 'AuthorizeCtrl',
        resolve: {
          User: ['$q', 'User', function ($q, User) {
            var deferred = $q.defer();

            User.session().then(function () {
              deferred.resolve(User);
            })

            return deferred.promise;
          }]
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
        controller: 'AccountCtrl'
      })
      .when('/account/apps', {
        templateUrl: 'views/apps.html',
        controller: 'AppsCtrl'
      })
      .otherwise({
        redirectTo: '/signin'
      });
  })

  .run(function (User) {
    User.session()
  })

'use strict';

angular.module('OAuth2UI.controllers', [])
  .controller('AuthorizeCtrl', function ($scope, $routeParams, $location, Flow, User) {

    Flow.setParams($routeParams);

    if (!User.isAuthenticated()) {
      $location.path('/signin')
    }

    $scope.authorization = Flow.getParams();

    function authDetailsSuccess (response) {
      console.log('RESPONSE', response)
      $scope.client = response.data.app;
      $scope.scope = response.data.scope;
    }

    function authDetailsFailure (fault) {
      console.log('FAULT', fault)
    }

    Flow.getDetails().then(authDetailsSuccess, authDetailsFailure);

    $scope.user = User;

    $scope.logout = function () {
      User.logout().then(function () {
        $location.path('/signin');
      });
    };
  })

'use strict';

angular.module('OAuth2UI.controllers')
  .controller('SigninCtrl', function ($scope, $location, User, Flow) {
    $scope.credentials = {};
    $scope.message = '';

    $scope.login = function () {
      function success (response) {
        console.log('SUCCESS', User);
        $location.path(Flow.destination());
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

angular.module('OAuth2UI.controllers')
  .controller('AccountCtrl', function ($scope, $location, User) {

    if (!User.isAuthenticated()) { $location.path('/signin'); }

    $scope.user = User;

  })




'use strict';

angular.module('OAuth2UI.controllers')
  .controller('AppsCtrl', function ($scope, $location, User) {

    if (!User.isAuthenticated()) { $location.path('/signin'); }

    User.apps().then(function (data) {
      $scope.apps = data;
      console.log('SCOPE APPS', $scope.apps);
    });

  })



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
      var user = this;

      function success (response) {
        if (response.data.authenticated) {
          user.isAuthenticated(response.data.account);
        }
      }

      return $http.get('/session').then(success);
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