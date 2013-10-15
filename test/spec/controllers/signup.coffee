'use strict'

describe 'SignupCtrl', ->


  {SignupCtrl,scope} = {}


  beforeEach module 'OAuth2UI'


  beforeEach inject ($injector) ->
    $controller = $injector.get '$controller'
    $rootScope = $injector.get '$rootScope'

    scope = $rootScope.$new();
    SignupCtrl = $controller 'SignupCtrl', $scope: scope


  it 'should have scope', ->
    expect(scope.email).toBe undefined