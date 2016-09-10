'use strict'
/* eslint-env mocha */

const assert = require('chai').assert
const setup = require('./../setup')
const uuid = require('node-uuid')
require('co-mocha')

describe('Integration | Service | User', function () {
  let Event, User,
    sut

  function email () {
    return `${uuid.v4()}@example.com`
  }

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    Event = use('Event')
    User = use('App/Model/User')

    sut = make('App/Services/User')
  })

  describe('#signUp', function () {
    it('validates rules', function * () {
      try {
        yield sut.signUp({})
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException')
      }
    })

    it('should create new user', function * () {
      const user = yield sut.signUp({ email: email(), password: 'secret1234' })

      assert.instanceOf(user, User)
      assert.isFalse(user.isNew())
    })

    it('should fire user.signed-up', function * () {
      let eventFired = false
      let args = null
      Event.removeListeners('user.signed-up')
      Event.on('user.signed-up', function * () {
        eventFired = true
        args = arguments
      })

      const user = yield sut.signUp({ email: email(), password: 'secret1234' })

      // assert.equal(sut.getEvent(), Event)
      assert.isTrue(eventFired)
      assert.equal(args[ 0 ], user)
    })
  })
})
