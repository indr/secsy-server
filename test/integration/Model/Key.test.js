/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const context = require('../../contexts').integration
const uuid = require('node-uuid')
const validation = require('./../validation')

const fails = validation.fails
const succeeds = validation.succeeds

require('co-mocha')

context('Integration | Model | Key', function () {
  let userId, Key

  before(function * () {
    Key = use('App/Model/Key')
    const User = use('App/Model/User')
    userId = (yield User.create({ email: uuid.v1() + '@exampel.com', password: 'Secret123$' })).id
  })

  describe('rules', function () {
    it('should validate email_sha256', function * () {
      yield fails(Key, Key.rules, 'email_sha256', [ undefined, '', ' ', 'abc123', Array(66).join('x') ])
      yield succeeds(Key, Key.rules, 'email_sha256', Array(65).join('x'))
    })

    it('should validate private_key', function * () {
      yield fails(Key, Key.rules, 'private_key', [ undefined, '' ])
      yield succeeds(Key, Key.rules, 'private_key', ' ')
    })

    it('should validate public_key', function * () {
      yield fails(Key, Key.rules, 'public_key', [ undefined, '' ])
      yield succeeds(Key, Key.rules, 'public_key', ' ')
    })
  })

  describe('updateRules', function () {
    it('should validate private_key', function * () {
      yield fails(Key, Key.updateRules, 'private_key', [ undefined, '' ])
      yield succeeds(Key, Key.updateRules, 'private_key', ' ')
    })

    it('should validate public_key', function * () {
      yield fails(Key, Key.updateRules, 'public_key', [ undefined, '' ])
      yield succeeds(Key, Key.updateRules, 'public_key', ' ')
    })
  })

  describe('crud', function () {
    it('should be able to create and retrieve a new key', function * () {
      const emailSha256 = `${userId}@example.com`
      let key = yield Key.create({
        owned_by: userId,
        email_sha256: emailSha256,
        private_key: 'PRIVATE KEY',
        public_key: 'PUBLIC KEY'
      })

      let fromDb = yield Key.find(key.id)
      assert.lengthOf(fromDb.id, 36)
      assert.equal(fromDb.owned_by, userId)
      assert.equal(fromDb.email_sha256, emailSha256)
      assert.equal(fromDb.is_public, false)
      assert.equal(fromDb.private_key, 'PRIVATE KEY')
      assert.equal(fromDb.public_key, 'PUBLIC KEY')
    })

    it('should enforce unique email_sha256', function * () {
      const emailSha256 = userId
      let data = {
        email_sha256: emailSha256,
        private_key: 'PRIVATE KEY',
        public_key: 'PUBLIC_KEY'
      }
      yield Key.create(data)
      try {
        yield Key.create(data)
      } catch (err) {
        assert.equal(err.constraint, 'keys_email_sha256_unique')
        assert.equal(err.routine, '_bt_check_unique')
      }
    })
  })

  describe('#toJSON', function () {
    let emailSha256, key

    beforeEach(function * () {
      emailSha256 = `${uuid.v4()}@example.com`
      key = yield Key.create({
        owned_by: userId,
        email_sha256: emailSha256,
        private_key: 'PRIVATE KEY',
        public_key: 'PUBLIC KEY'
      })
    })

    it('should omit private_key for not owned key', function * () {
      var json = key.toJSON()

      assert.deepEqual(json, {
        email_sha256: emailSha256,
        id: key.id,
        public_key: 'PUBLIC KEY'
      })
    })

    it('should return private_key for owned key', function * () {
      var json = key.toJSON(userId)

      assert.deepEqual(json, {
        email_sha256: emailSha256,
        id: key.id,
        private_key: 'PRIVATE KEY',
        public_key: 'PUBLIC KEY'
      })
    })
  })
})
