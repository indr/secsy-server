'use strict'
/* eslint-env mocha */

const chai = require('chai')
const moment = require('moment')
require('co-mocha')

const setup = require('../setup')

const assert = chai.assert

describe('Integration | Model | EmailToken', function () {
  let EmailToken, User,
    user

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    EmailToken = use('App/Model/EmailToken')
    User = use('App/Model/User')

    user = yield User.create({ email: 'user@example.com', password: 'secret' })
  })

  after(function * () {
    const Db = use('Database')
    yield Db.raw('truncate users cascade')
  })

  afterEach(function * () {
    const Db = use('Database')
    yield Db.truncate('email_tokens')
  })

  describe('crud', function () {
    it('should be able to create a new email token', function * () {
      const emailToken = yield EmailToken.create({
        user_id: user.id,
        email: 'user@example.com'
      })
      emailToken.confirmed = false
      emailToken.expired = false

      const fromDb = yield EmailToken.find(emailToken.id)

      assert.equal(fromDb.id, emailToken.id)
      assert.equal(moment(fromDb.created_at).toString(), moment().toString())
      assert.equal(fromDb.updated_at, fromDb.created_at)
      assert.equal(fromDb.user_id, emailToken.user_id)
      assert.equal(fromDb.token, emailToken.token)
      assert.equal(fromDb.confirmed, false)
      assert.equal(fromDb.expired, false)
    })
  })

  describe('after create', function () {
    it('should expire previous unconfirmed tokens', function * () {
      const details = { user_id: user.id, email: user.email }
      const previousUnconfirmed = yield EmailToken.create(details)

      yield EmailToken.create(details)

      const fromDb = yield EmailToken.find(previousUnconfirmed.id)

      assert.isFalse(fromDb.confirmed)
      assert.isTrue(fromDb.expired)
    })

    it('should not expire previous confirmed tokens', function * () {
      const details = { user_id: user.id, email: user.email }
      const previousConfirmed = yield EmailToken.create(details)
      previousConfirmed.confirmed = true
      yield previousConfirmed.save()

      yield EmailToken.create(details)

      const fromDb = yield EmailToken.find(previousConfirmed.id)

      assert.isTrue(fromDb.confirmed)
      assert.isFalse(fromDb.expired)
    })
  })

  describe('#confirm', function () {
    let sut

    beforeEach(function * () {
      sut = yield EmailToken.create({
        user_id: user.id,
        email: user.email
      })
    })

    it('should throw given already confirmed', function * () {
      sut.confirmed = true

      try {
        sut.confirm()
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException')
        assert.equal(error.message, 'Email token is already confirmed')
      }
    })

    it('should throw given expired', function * () {
      sut.created_at = moment().subtract(3, 'days')

      try {
        sut.confirm()
        assert(false)
      } catch (error) {
        assert.equal(error.name, 'ValidationException')
        assert.equal(error.message, 'Email token has expired')
      }
    })

    it('should return true and be confirmed', function * () {
      var result = sut.confirm()
      assert.isTrue(result)
      assert.isTrue(sut.confirmed)
    })
  })
})
