'use strict'
/* eslint-env mocha */

const assert = require('chai').assert
const emailParser = require('./../../test-helpers/email')
const setup = require('./../setup')
const uuid = require('node-uuid')
require('co-mocha')

describe('Integration | Service | User', function () {
  let Config, Event, User, EmailToken,
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
    EmailToken = use('App/Model/EmailToken')

    sut = make('App/Services/UserService')
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
      assert.match(email.textBody, new RegExp(`/app/activate/${emailToken.token}`))
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

  describe('#confirm', function () {
    let userId, token

    beforeEach(function * () {
      const user = yield sut.signup({ email: genEmail(), password: 'secret1234' })
      userId = user.id
      token = (yield user.emailTokens().fetch()).first().token
    })

    it('should throw ValidationException given token is unknown', function * () {
      try {
        yield sut.confirm('unkown token')
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException')
        assert.equal(error.message, 'Email token not found')
        assert.equal(error.status, 404)
      }
    })

    it('should confirm email token', function * () {
      yield sut.confirm(token)

      const emailToken = (yield EmailToken.query().where('token', token).fetch()).first()
      assert.isTrue(emailToken.confirmed)
    })

    it('should activate user', function * () {
      yield sut.confirm(token)

      const user = yield User.findOrFail(userId)
      assert.isTrue(user.confirmed)
    })

    it('should fire user.confirmed', function * () {
      let eventFired = false
      let args = null
      Event.removeListeners('user.confirmed')
      Event.on('user.confirmed', function * () {
        eventFired = true
        args = arguments
      })
      yield sut.confirm(token)

      assert.isTrue(eventFired)
      const user = yield User.findOrFail(userId)
      assert.instanceOf(args[ 0 ], User)
      assert.equal(args[ 0 ].id, user.id)
    })
  })

  describe('#resend', function () {
    let user

    beforeEach(function * () {
      user = yield sut.signup({ email: genEmail(), password: 'secret1234' })
    })

    it('should throw ValidationException given email is unknown', function * () {
      try {
        yield sut.resend('unknown@example.com')
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException')
        assert.equal(error.message, 'user-not-found')
        assert.equal(error.status, 404)
      }
    })

    it('should throw ValidationException given user is already confirmed', function * () {
      user.confirmed = true
      yield user.save()

      try {
        yield sut.resend(user.email)
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException')
        assert.equal(error.message, 'user-not-found')
        assert.equal(error.status, 404)
      }
    })

    it('should create email token', function * () {
      yield sut.resend(user.email)

      const emailTokens = yield user.emailTokens().fetch()
      assert.equal(emailTokens.size(), 2)
    })

    it('should send account activation email', function * () {
      yield sut.resend(user.email)

      let emailToken = (yield user.emailTokens().where('expired', false).fetch()).first()
      assert.isFalse(emailToken.confirmed)
      assert.isFalse(emailToken.expired)
      let email = yield emailParser.getEmail(Config.get('mail.log.toPath'), 'recent')
      assert.deepEqual(email.to, [ { address: user.email, name: '' } ])
      assert.match(email.textBody, new RegExp(`/app/activate/${emailToken.token}`))
    })
  })

  describe('#forgot', function () {
    let user

    beforeEach(function * () {
      user = yield sut.signup({ email: genEmail(), password: 'secret1234' })
    })

    it('should throw ValidationException given email is unknown', function * () {
      try {
        yield sut.forgot('unknown@example.com')
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException')
        assert.equal(error.message, 'user-not-found')
        assert.equal(error.status, 404)
      }
    })

    it('should create email token', function * () {
      yield sut.forgot(user.email)

      const emailTokens = yield user.emailTokens().fetch()
      assert.equal(emailTokens.size(), 2)
    })

    it('should send reset password email', function * () {
      yield sut.forgot(user.email)

      let emailToken = (yield user.emailTokens().where('expired', false).fetch()).first()
      assert.isFalse(emailToken.confirmed)
      assert.isFalse(emailToken.expired)
      let email = yield emailParser.getEmail(Config.get('mail.log.toPath'), 'recent')
      assert.deepEqual(email.to, [ { address: user.email, name: '' } ])
      assert.match(email.textBody, new RegExp(`/app/password-reset/${emailToken.token}`))
    })
  })
})
