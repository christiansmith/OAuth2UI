'use strict'

describe 'SigninCtrl', ->


  {SigninCtrl,scope} = {}


  beforeEach module 'OAuth2UI'


  beforeEach inject ($injector) ->
    $controller = $injector.get '$controller'
    $rootScope = $injector.get '$rootScope'

    scope = $rootScope.$new();
    SigninCtrl = $controller 'SigninCtrl', $scope: scope


  describe 'initial state', ->

    it 'should have a blank credentials', ->
      expect(scope.credentials).toEqual {}

    it 'should have an empty message', ->
      expect(scope.message).toBe ''
