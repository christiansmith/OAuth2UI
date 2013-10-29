'use strict'

describe 'User', ->


  {User,$httpBackend,$location} = {}


  beforeEach module 'OAuth2UI.services'


  beforeEach inject ($injector) ->
    User = $injector.get 'User'
    $location = $injector.get '$location'
    $httpBackend =  $injector.get '$httpBackend'


  afterEach ->
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()



  it 'should be an object', ->
    expect(typeof User).toBe 'object'

  it 'should not initially be authenticated', ->
    expect(User.constructor.isAuthenticated).toBe false

  it 'should not initially require authentication', ->
    expect(User.constructor.requiresAuthentication).toBe false

  it 'should be able to require authentication', ->
    User.requireAuthentication()
    expect(User.constructor.requiresAuthentication).toBe true

  it 'should know if it requires authentication', ->
    expect(User.requiresAuthentication()).toBe false
    User.requireAuthentication()
    expect(User.requiresAuthentication()).toBe true

  it 'should know if it is authenticated', ->
    expect(User.isAuthenticated()).toBe false



  describe 'when authenticated', ->
    beforeEach ->
      User.isAuthenticated { name: 'John Smith' }

    it 'should know it is authenticated', ->
      expect(User.isAuthenticated()).toBe true

    it 'should know who is authenticated', ->
      expect(User.name).toBe 'John Smith'

    it 'should not require authentication', ->
      expect(User.requiresAuthentication()).toBe false



  describe 'signing up with valid credentials', ->

    it 'should post a signup', ->
      validSignup =
        name: 'John Smith'
        username: 'johnsmith'
        email: 'john@example.com'
        password: 'secret'

      $httpBackend.expectPOST('/signup', validSignup).respond({ 
        authenticated: true
        user: validSignup 
      })

      User.signup(validSignup)
      $httpBackend.flush()



  describe 'logging in with valid credentials', ->
    promise = undefined

    beforeEach ->
      form =
        email: 'guest@example.com'
        password: 'secret'

      $httpBackend.expectPOST('/login', form).respond({
        authenticated: true,
        user: {name:'John Smith'}
      })
      
      promise = User.login(form)
      $httpBackend.flush()

    it 'should return a promise', ->
      expect(typeof promise.then).toBe 'function'
    
    it 'should become authenticated', ->
      expect(User.isAuthenticated()).toBe true

    it 'should not require authentication', ->
      expect(User.requiresAuthentication()).toBe false

    it 'should have its own properties', ->
      expect(User.name).toBe 'John Smith'



  describe 'logging in with invalid credentials', ->
    promise = undefined

    beforeEach ->
      form =
        email: 'guest@example.com'
        password: 'wrong'

      $httpBackend.expectPOST('/login', form).respond({
        authenticated: false,
        message: 'Invalid password!'
      })
      
      User.requireAuthentication()
      promise = User.login(form)
      $httpBackend.flush()

    it 'should return a promise', ->
      expect(typeof promise.then).toBe 'function'
    
    it 'should not become authenticated', ->
      expect(User.isAuthenticated()).toBe false

    it 'should still require authentication', ->
      expect(User.requiresAuthentication()).toBe true

    it 'should not have its own properties', ->
      expect(User.name).toBe undefined



  describe 'reset to anonymous', ->
    beforeEach ->
      User.isAuthenticated { name: 'John Smith' }
      expect(User.isAuthenticated()).toBe true
      User.reset()

    it 'should reset isAuthenticated to false', ->
      expect(User.isAuthenticated()).toBe false

    it 'should reset requiresAuthentication to false', ->
      expect(User.requiresAuthentication()).toBe false

    it 'should reset the user properties', ->
      expect(User.name).toBe undefined



  describe 'logging out', ->
    beforeEach ->
      spyOn User, 'reset'
      User.isAuthenticated { name: 'John Smith' }
      spyOn $location, 'path'
      $httpBackend.expectPOST('/logout').respond {}
      User.logout()
      $httpBackend.flush()

    it 'should reset to anonymous', ->
      expect(User.reset).toHaveBeenCalled()

    it 'should navigate home', ->
      expect($location.path).toHaveBeenCalledWith '/'



  describe 'after requesting session', ->
    beforeEach ->
      $httpBackend.expectGET('/session')
        .respond(200, { authenticated: true, user: {name: 'John Smith'}})
      User.session()
      $httpBackend.flush()

    it 'should be authenticated if logged in', ->
      expect(User.isAuthenticated()).toBe true

    it 'should not require authentication if logged in', ->
      expect(User.requiresAuthentication()).toBe false

    it 'should have user properties if logged in', ->
      expect(User.name).toBe 'John Smith'

