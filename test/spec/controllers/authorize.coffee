'use strict'

describe 'AuthorizeCtrl', ->


  {AuthorizeCtrl,Authorization,User,$rootScope,$controller,$location,$q,scope} = {}


  beforeEach module 'OAuth2UI.controllers'
  beforeEach module 'OAuth2UI.services'


  beforeEach inject ($injector) ->
    User          = $injector.get 'User'
    Authorization = $injector.get 'Authorization'
    $controller   = $injector.get '$controller'
    $location     = $injector.get '$location'
    $rootScope    = $injector.get '$rootScope'
    $routeParams  = $injector.get '$routeParams'
    $q            = $injector.get '$q'

    $routeParams.foo = 'bar'
    scope = $rootScope.$new();
    AuthorizeCtrl = $controller 'AuthorizeCtrl', $scope: scope


  it 'should set authorization parameters from the querystring', ->
    expect(Authorization.getParams().foo).toBe 'bar'

  it 'should direct unauthenticated users to sign in', ->
    expect($location.path()).toBe '/signin'

  it 'should fetch client and scope details', ->
    spyOn(Authorization, 'getDetails').andCallFake -> $q.defer().promise
    User.isAuthenticated name: 'whatever'
    scope = $rootScope.$new();
    AuthorizeCtrl = $controller 'AuthorizeCtrl', $scope: scope
    expect(Authorization.getDetails).toHaveBeenCalled()

  it 'should log the user out', ->
    spyOn(User, 'logout').andCallFake -> $q.defer().promise
    scope.logout()
    expect(User.logout).toHaveBeenCalled()