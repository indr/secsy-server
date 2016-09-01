/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

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
    Validator = use('Validator')
  })

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

  describe('rules', function () {
    it('should validate username', function * () {
      yield fails(User, 'username', [ undefined, '', ' ', 'four' ])
      yield succeeds(User, 'username', [ 'user-rules@example.com' ])
    })

    it('should validate email', function * () {
      yield fails(User, 'email', [ undefined, '', ' ', 'a', 'mail@localhost' ])
      yield succeeds(User, 'email', [ 'a@b.com', 'user-1234abcd@example.com' ])
    })

    it('should validate password', function * () {
      yield fails(User, 'password', [ undefined, '', ' ', '1234567' ])
      yield succeeds(User, 'password', '12345678')
    })
  })

  describe('crud', function () {
    it('should be able to create and retrieve a new user', function * () {
      let user = yield User.create({
        email: `${uuid.v4()}@example.com`,
        password: 'user1234'
      })

      const fromDb = yield User.find(user.id)
      assert.lengthOf(fromDb.id, 36)
      assert.equal(fromDb.username, user.email)
      assert.notEqual(fromDb.password, 'user1234')
      assert.equal(fromDb.email_sha256, sha256(user.email))
    })
  })
})
