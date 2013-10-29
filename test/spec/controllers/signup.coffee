'use strict'

describe 'SignupCtrl', ->


  {SignupCtrl,User,$timeout,$q,scope} = {}


  beforeEach module 'OAuth2UI.controllers'
  beforeEach module 'OAuth2UI.services'


  beforeEach inject ($injector) ->
    $controller = $injector.get '$controller'
    $rootScope = $injector.get '$rootScope'
    $timeout = $injector.get '$timeout'
    $q = $injector.get '$q'
    User = $injector.get 'User'

    scope = $rootScope.$new();
    SignupCtrl = $controller 'SignupCtrl', $scope: scope, User



  describe 'initial state', ->

    it 'should have a blank registration', ->
      expect(scope.registration).toEqual {}

    it 'should have an empty message', ->
      expect(scope.message).toBe ''

    it 'should have an empty message type', ->
      expect(scope.messageType).toBe ''



  describe 'successful signup', ->

    beforeEach ->
      spyOn(User, 'signup').andCallFake ->
        deferred = $q.defer()
        resolve = -> deferred.resolve {}
        $timeout resolve, 1000
        return deferred.promise

      scope.registration =
        email:    'john@example.com'
        password: 'secret'

      scope.signup()
      $timeout.flush()

    it 'should reset the registration', ->
      expect(scope.registration).toEqual {}



  describe 'failed signup', ->

    beforeEach ->
      spyOn(User, 'signup').andCallFake ->
        deferred = $q.defer()
        reject = -> deferred.reject { error: 'Email already registered' }
        $timeout reject, 1000
        return deferred.promise

      scope.registration =
        email:    'existing@example.com'
        password: 'secret'

      scope.signup()
      $timeout.flush()    

    #it 'should set an error message', ->
    #  expect(scope.message).toBe 'Email already registered'

