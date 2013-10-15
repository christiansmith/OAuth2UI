'use strict'

describe 'AuthorizeCtrl', ->


  {AuthorizeCtrl,scope} = {}


  beforeEach module 'OAuth2UI'


  beforeEach inject ($injector) ->
    $controller = $injector.get '$controller'
    $rootScope = $injector.get '$rootScope'

    scope = $rootScope.$new();
    AuthorizeCtrl = $controller 'AuthorizeCtrl', $scope: scope


  it 'should have scope', ->
    expect(scope.scope.length).toBe 3