'use strict'

describe 'AuthorizeCtrl', ->


  {AuthorizeCtrl,Flow,User,client,scopes,$rootScope,$controller,$location,$q,scope} = {}


  beforeEach module 'OAuth2UI.controllers'
  beforeEach module 'OAuth2UI.services'


  beforeEach inject ($injector) ->
    User          = $injector.get 'User'
    $controller   = $injector.get '$controller'
    $rootScope    = $injector.get '$rootScope'
    $q            = $injector.get '$q'

    client = name: 'Foo'
    scopes = url: 'description'
    Flow = app: client, scope: scopes

    #$routeParams.foo = 'bar'
    scope = $rootScope.$new()
    AuthorizeCtrl = $controller 'AuthorizeCtrl', $scope: scope, Flow: Flow, User: User


  it 'should have a client', ->
    expect(scope.client).toBe client

  it 'should have scope descriptions', ->
    expect(scope.scope).toBe scopes

  it 'should have a user', ->
    expect(scope.user).toBe User

  it 'should log the user out', ->
    spyOn(User, 'logout').andCallFake -> $q.defer().promise
    scope.logout()
    expect(User.logout).toHaveBeenCalled()
