'use strict'

describe 'SigninCtrl', ->


  {SigninCtrl,scope} = {}


  beforeEach module 'OAuth2UI'


  beforeEach inject ($injector) ->
    $controller = $injector.get '$controller'
    $rootScope = $injector.get '$rootScope'

    scope = $rootScope.$new();
    SigninCtrl = $controller 'SigninCtrl', $scope: scope


  it 'should have scope', ->
    expect(scope.email).toBe undefined