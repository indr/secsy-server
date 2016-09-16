'use strict'
/* eslint-env mocha */

const _ = require('lodash')
const assert = require('chai').assert
require('co-mocha')
const setup = require('./../setup')
const uuid = require('node-uuid')
const sha256 = require('./../../../lib/sha256')
const validation = require('./../validation')

const fails = validation.fails
const succeeds = validation.succeeds

describe('Integration | Model | User', function () {
  let User, Validator

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    User = use('App/Model/User')
    Validator = use('App/Services/Validator')
  })

  function makeEmail () {
    return `${uuid.v4()}@example.com`
  }

  describe('sanitazions', function () {
    function * sanitize (field, value, expected) {
      const data = {}
      data[ field ] = value
      const sanitizations = _.pick(User.sanitations, field)
      let actual = yield Validator.sanitize(data, sanitizations)
      actual = actual[ field ]
      assert(actual === expected, `exepected sanitized "${actual}" to equal "${expected}"`)
    }

    it('should sanitize email', function * () {
      yield sanitize('email', 'User@Example.Com', 'user@example.com')
      yield sanitize('email', 'bar.sneaky+foo@gmail.com', 'barsneaky@gmail.com')
    })
  })

  describe('signupRules', function () {
    it('should validate username', function * () {
      yield fails(User, User.signupRules, 'username', [ undefined, '', ' ', 'four' ])
      yield succeeds(User, User.signupRules, 'username', [ 'user-rules@example.com' ])
    })

    it('should validate email', function * () {
      yield fails(User, User.signupRules, 'email', [ undefined, '', ' ', 'a', 'mail@localhost' ])
      yield succeeds(User, User.signupRules, 'email', [ 'a@b.com', 'user-1234abcd@example.com' ])
    })

    it('should validate password', function * () {
      yield fails(User, User.signupRules, 'password', [ undefined, '', ' ', '12345678' ])
      yield succeeds(User, User.signupRules, 'password', 'abcABC123$')
    })

    it('should validate locale', function * () {
      yield fails(User, User.signupRules, 'locale', [ undefined, '', ' ', 'abcde', 'de-de', 'de_DE' ])
      yield succeeds(User, User.signupRules, 'locale', [ 'en-US', 'de-CH', 'de-DE' ])
    })
  })

  describe('resetPasswordRules', function () {
    it('should validate password', function * () {
      yield fails(User, User.resetPasswordRules, 'password', [ undefined, '', ' ', '12345678' ])
      yield succeeds(User, User.resetPasswordRules, 'password', 'abcABC123$')
    })
  })

  describe('crud', function () {
    it('should be able to create and retrieve a new user', function * () {
      let user = yield User.create({
        email: makeEmail(),
        password: 'user1234'
      })
      var emailToken = yield user.emailTokens().create({ email: user.email })

      var fromDb = yield User.find(user.id)
      assert.lengthOf(fromDb.id, 36)
      assert.equal(fromDb.username, user.email)
      assert.notEqual(fromDb.password, 'user1234')
      assert.equal(fromDb.email_sha256, sha256(user.email))

      fromDb = yield fromDb.emailTokens().fetch()
      assert.equal(fromDb.size(), 1)
      assert.equal(fromDb.first().id, emailToken.id)
    })
  })
})
