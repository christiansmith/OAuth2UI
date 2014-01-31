'use strict'

describe 'Flow', ->


  {Flow,User,$q,$route,$httpBackend,$location} = {}


  beforeEach module 'OAuth2UI.services'


  beforeEach inject ($injector) ->
    Flow = $injector.get 'Flow'
    User = $injector.get 'User'
    $route = $injector.get '$route'
    $q = $injector.get '$q'


    $route.current = { params: { client_id: 'ID' } }
    $location = $injector.get '$location'
    $httpBackend =  $injector.get '$httpBackend'


  afterEach ->
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()


  describe 'redirect', ->

    it 'should change the browser location to a given uri'


  describe 'authorize', ->

    it 'should get the descriptions', ->
      $httpBackend.expectGET('/authorize?client_id=ID').respond({
        app:   { name: 'Foo' }
        scope: { 'http://foo.com/api': 'access your foo' }
      })

      Flow.params.client_id = 'ID'
      Flow.authorize()
      $httpBackend.flush()
      expect(Flow.app.name).toBe 'Foo'

    it 'should redirect if response contains redirect_uri', ->
      spyOn Flow, 'redirect'
      $httpBackend.expectGET('/authorize?client_id=ID').respond({
        redirect_uri: 'https://yourapp/callback'
      })

      Flow.params.client_id = 'ID'
      Flow.authorize()
      $httpBackend.flush()
      expect(Flow.redirect).toHaveBeenCalledWith 'https://yourapp/callback'


  describe 'resolve', ->

    it 'should capture route params', ->
      $httpBackend.expectGET('/session').respond({ authenticated: false })
      Flow.resolve()
      expect(Flow.params.client_id).toBe 'ID'
      $httpBackend.flush()

    it 'should require an authenticated user', ->
      $httpBackend.expectGET('/session').respond({ authenticated: false })
      spyOn $location, 'url'
      Flow.resolve()
      $httpBackend.flush()
      expect($location.url).toHaveBeenCalledWith '/signin'

    it 'should return a promise', ->
      $httpBackend.expectGET('/session').respond({ authenticated: true })
      spyOn(Flow, 'authorize').andReturn $q.defer().promise
      expect(typeof Flow.resolve().then).toBe 'function'
      $httpBackend.flush()



