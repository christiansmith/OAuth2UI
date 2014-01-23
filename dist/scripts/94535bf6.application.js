'use strict';
angular.module('OAuth2UI', [
  'OAuth2UI.controllers',
  'OAuth2UI.services'
]).config([
  '$routeProvider',
  '$locationProvider',
  '$httpProvider',
  function ($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';
    $httpProvider.interceptors.push('AuthenticationInterceptor');
    $routeProvider.when('/authorize', {
      templateUrl: 'views/authorize.html',
      controller: 'AuthorizeCtrl'
    }).when('/signin', {
      templateUrl: 'views/signin.html',
      controller: 'SigninCtrl'
    }).when('/signup', {
      templateUrl: 'views/signup.html',
      controller: 'SignupCtrl'
    }).when('/account', {
      templateUrl: 'views/account.html',
      controller: 'AccountCtrl'
    }).when('/account/apps', {
      templateUrl: 'views/apps.html',
      controller: 'AppsCtrl'
    }).otherwise({ redirectTo: '/signin' });
  }
]).run([
  'User',
  function (User) {
    User.session();
  }
]);
'use strict';
angular.module('OAuth2UI.controllers', []).controller('AuthorizeCtrl', [
  '$scope',
  '$routeParams',
  '$location',
  'Flow',
  'User',
  function ($scope, $routeParams, $location, Flow, User) {
    Flow.setParams($routeParams);
    if (!User.isAuthenticated()) {
      $location.path('/signin');
    }
    $scope.authorization = Flow.getParams();
    function authDetailsSuccess(response) {
      console.log('RESPONSE', response);
      $scope.client = response.data.app;
      $scope.scope = response.data.scope;
    }
    function authDetailsFailure(fault) {
      console.log('FAULT', fault);
    }
    Flow.getDetails().then(authDetailsSuccess, authDetailsFailure);
    $scope.user = User;
    $scope.logout = function () {
      User.logout().then(function () {
        $location.path('/signin');
      });
    };
  }
]);
'use strict';
angular.module('OAuth2UI.controllers').controller('SigninCtrl', [
  '$scope',
  '$location',
  'User',
  'Flow',
  function ($scope, $location, User, Flow) {
    $scope.credentials = {};
    $scope.message = '';
    $scope.login = function () {
      function success(response) {
        console.log('SUCCESS', User);
        $location.path(Flow.destination());
      }
      function failure(fault) {
        console.log('FAILURE', fault.data);
        $scope.message = fault.data.error;
      }
      User.login($scope.credentials).then(success, failure);
    };
  }
]);
'use strict';
angular.module('OAuth2UI.controllers').controller('SignupCtrl', [
  '$scope',
  '$location',
  'User',
  function ($scope, $location, User) {
    $scope.signup = function () {
      function success() {
        $scope.reset();
        $location.path('/authorize');
      }
      function failure(fault) {
        $scope.message = fault.data.error;
      }
      User.signup($scope.registration).then(success, failure);
    };
    $scope.reset = function () {
      $scope.registration = {};
      $scope.message = '';
      $scope.messageType = '';
    };
    $scope.reset();
  }
]);
'use strict';
angular.module('OAuth2UI.controllers').controller('AccountCtrl', [
  '$scope',
  '$location',
  'User',
  function ($scope, $location, User) {
    if (!User.isAuthenticated()) {
      $location.path('/signin');
    }
    $scope.user = User;
  }
]);
'use strict';
angular.module('OAuth2UI.controllers').controller('AppsCtrl', [
  '$scope',
  '$location',
  'User',
  function ($scope, $location, User) {
    if (!User.isAuthenticated()) {
      $location.path('/signin');
    }
    User.apps().then(function (data) {
      $scope.apps = data;
      console.log('SCOPE APPS', $scope.apps);
    });
  }
]);
'use strict';
angular.module('OAuth2UI.services', []).factory('Flow', [
  '$location',
  '$http',
  function ($location, $http) {
    var params = {};
    return {
      destination: function () {
        return Object.keys(params).length > 0 ? '/authorize' : '/account';
      },
      getDetails: function () {
        return $http({
          method: 'GET',
          url: '/authorize',
          params: params,
          headers: { 'Content-type': 'application/json' }
        });
      },
      setParams: function (p) {
        Object.keys(p).forEach(function (key) {
          params[key] = p[key];
        });
        $location.url($location.path());
      },
      getParams: function () {
        return params;
      }
    };
  }
]);
'use strict';
angular.module('OAuth2UI.services').factory('User', [
  '$q',
  '$http',
  '$location',
  function ($q, $http, $location) {
    function User() {
    }
    User.isAuthenticated = false;
    User.requiresAuthentication = false;
    User.prototype.requireAuthentication = function () {
      User.requiresAuthentication = true;
    };
    User.prototype.requiresAuthentication = function () {
      return User.requiresAuthentication;
    };
    User.prototype.isAuthenticated = function (user) {
      if (user) {
        var key;
        for (key in user) {
          this[key] = user[key];
        }
        User.isAuthenticated = true;
        User.requiresAuthentication = false;
        return User;
      } else {
        return User.isAuthenticated;
      }
    };
    User.prototype.signup = function (registration) {
      var user = this;
      function success(response) {
        user.isAuthenticated(response.data.account);
      }
      return $http.post('/signup', registration).then(success);
    };
    User.prototype.login = function (credentials) {
      var user = this;
      function success(response) {
        user.isAuthenticated(response.data.account);
      }
      return $http.post('/login', credentials).then(success);
    };
    User.prototype.reset = function () {
      var key;
      for (key in this) {
        delete this[key];
      }
      User.isAuthenticated = false;
      User.requiresAuthentication = false;
    };
    User.prototype.logout = function () {
      var user = this;
      function success(response) {
        user.reset();
        $location.path('/');
      }
      return $http.post('/logout').then(success);
    };
    User.prototype.session = function () {
      var user = this;
      function success(response) {
        if (response.data.authenticated) {
          user.isAuthenticated(response.data.account);
        }
      }
      return $http.get('/session').then(success);
    };
    User.prototype.apps = function () {
      var deferred = $q.defer();
      function success(response) {
        deferred.resolve(response.data);
      }
      function failure(fault) {
        deferred.reject(fault);
      }
      $http.get('/session/apps').then(success, failure);
      return deferred.promise;
    };
    return new User();
  }
]);
'use strict';
angular.module('OAuth2UI').filter('controlError', function () {
  return function (input) {
    if (input.$dirty && input.$invalid) {
      return 'error';
    }
    return '';
  };
}).filter('isComplete', function () {
  return function (input) {
    return input.$dirty && input.$valid ? true : false;
  };
});
'use strict';
angular.module('OAuth2UI').factory('AuthenticationInterceptor', [
  '$q',
  '$injector',
  function ($q, $injector) {
    var $location;
    return {
      responseError: function (rejection) {
        $location = $location || $injector.get('$location');
        if (rejection.status === 401) {
          $location.path('/signin');
        }
        return $q.reject(rejection);
      }
    };
  }
]);