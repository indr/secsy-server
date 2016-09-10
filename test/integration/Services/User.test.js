'use strict'
/* eslint-env mocha */

const assert = require('chai').assert
const emailParser = require('./../../test-helpers/email')
const setup = require('./../setup')
const uuid = require('node-uuid')
require('co-mocha')

describe('Integration | Service | User', function () {
  let Config, Event, User,
    sut

  function genEmail () {
    return `${uuid.v4()}@example.com`
  }

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    Config = use('Config')
    Event = use('Event')
    User = use('App/Model/User')

    sut = make('App/Services/User')
  })

  after(function * () {
    yield emailParser.clean(Config.get('mail.log.toPath'))
  })

  describe('#signup', function () {
    it('validates rules', function * () {
      try {
        yield sut.signup({})
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException')
      }
    })

    it('should create new user', function * () {
      const user = yield sut.signup({ email: genEmail(), password: 'secret1234' })

      assert.instanceOf(user, User)
      assert.isFalse(user.isNew())
    })

    it('should create email token', function * () {
      const user = yield sut.signup({ email: genEmail(), password: 'secret1234' })
      const emailTokens = yield user.emailTokens().fetch()

      assert.equal(emailTokens.size(), 1)
      assert.equal(emailTokens.first().email, user.email)
    })

    it('should send account activation email', function * () {
      const user = yield sut.signup({ email: genEmail(), password: 'secret1234' })
      const emailToken = (yield user.emailTokens().fetch()).first()

      var email = yield emailParser.getEmail(Config.get('mail.log.toPath'), 'recent')
      assert.deepEqual(email.to, [ { address: user.email, name: '' } ])
      assert.match(email.textBody, new RegExp(`/app/account/activate/${emailToken.token}`))
    })

    it('should fire user.signed-up', function * () {
      let eventFired = false
      let args = null
      Event.removeListeners('user.signed-up')
      Event.on('user.signed-up', function * () {
        eventFired = true
        args = arguments
      })

      const user = yield sut.signup({ email: genEmail(), password: 'secret1234' })

      assert.isTrue(eventFired)
      assert.equal(args[ 0 ], user)
    })
  })
})
