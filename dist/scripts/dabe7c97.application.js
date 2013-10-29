"use strict";angular.module("OAuth2UI",[]).config(["$routeProvider","$locationProvider","$httpProvider",function(a,b,c){b.html5Mode(!0),b.hashPrefix="!",c.interceptors.push("AuthenticationInterceptor"),a.when("/authorize",{templateUrl:"views/authorize.html",controller:"AuthorizeCtrl"}).when("/signin",{templateUrl:"views/signin.html",controller:"SigninCtrl"}).when("/signup",{templateUrl:"views/signup.html",controller:"SignupCtrl"}).otherwise({redirectTo:"/signin"})}]).run(["User",function(a){a.session()}]),angular.module("OAuth2UI.controllers",[]).controller("AuthorizeCtrl",["$scope","$window","$routeParams","$location","Authorization","User",function(a,b,c,d,e,f){function g(b){console.log("RESPONSE",b),a.client=b.data.client,a.scope=b.data.scope}function h(a){console.log("FAULT",a)}e.setParams(c),f.isAuthenticated()||d.path("/signin"),e.getDetails().then(g,h),a.user=f,a.logout=function(){f.logout().then(function(){d.path("/signin")})}}]),angular.module("OAuth2UI.controllers").controller("SigninCtrl",["$scope","$location","User",function(a,b,c){a.credentials={},a.message="",a.login=function(){function d(){console.log("SUCCESS",c),b.path("/authorize")}function e(b){console.log("FAILURE",b.data),a.message=b.data.error}c.login(a.credentials).then(d,e)}}]),angular.module("OAuth2UI.controllers").controller("SignupCtrl",["$scope","$location","User",function(a,b,c){a.signup=function(){function d(){a.reset(),b.path("/authorize")}function e(b){a.message=b.data.error}c.signup(a.registration).then(d,e)},a.reset=function(){a.registration={},a.message="",a.messageType=""},a.reset()}]),angular.module("OAuth2UI.services").factory("User",["$http","$location",function(a,b){function c(){}return c.isAuthenticated=!1,c.requiresAuthentication=!1,c.prototype.requireAuthentication=function(){c.requiresAuthentication=!0},c.prototype.requiresAuthentication=function(){return c.requiresAuthentication},c.prototype.isAuthenticated=function(a){if(a){var b;for(b in a)this[b]=a[b];return c.isAuthenticated=!0,c.requiresAuthentication=!1,c}return c.isAuthenticated},c.prototype.signup=function(b){function c(a){d.isAuthenticated(a.data.user)}var d=this;return a.post("/signup",b).then(c)},c.prototype.login=function(b){function c(a){d.isAuthenticated(a.data.user)}var d=this;return a.post("/login",b).then(c)},c.prototype.reset=function(){var a;for(a in this)delete this[a];c.isAuthenticated=!1,c.requiresAuthentication=!1},c.prototype.logout=function(){function c(){d.reset(),b.path("/")}var d=this;return a.post("/logout").then(c)},c.prototype.session=function(){function b(a){a.data.authenticated&&c.isAuthenticated(a.data.user)}var c=this;return a.get("/session").then(b)},new c}]),angular.module("OAuth2UI.services",[]).factory("Authorization",["$location","$http",function(a,b){var c={};return{getDetails:function(){return b({method:"GET",url:"/authorize",params:c,headers:{"Content-type":"application/json"}})},setParams:function(b){Object.keys(b).forEach(function(a){c[a]=b[a]}),a.url(a.path())},getParams:function(){return c}}}]),angular.module("OAuth2UI").filter("controlError",function(){return function(a){return a.$dirty&&a.$invalid?"error":""}}).filter("isComplete",function(){return function(a){return a.$dirty&&a.$valid?!0:!1}}),angular.module("OAuth2UI").factory("AuthenticationInterceptor",["$q","$injector",function(a,b){var c;return{responseError:function(d){return c=c||b.get("$location"),401===d.status&&c.path("/signin"),a.reject(d)}}}]);