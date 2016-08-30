/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

const _ = require('lodash')
const assert = require('chai').assert
const setup = require('./../setup')
const uuid = require('node-uuid')
const sha256 = require('./../../../lib/sha256')
require('co-mocha')

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
    function * validate (expected, field, values) {
      values = _.isArray(values) ? values : [ values ]
      const data = {}
      const rules = _.pick(User.rules, field)
      for (var i = 0; i < values.length; i++) {
        let value = values[ i ]
        data[ field ] = value
        const result = yield Validator.validateAll(data, rules)
        assert(result.fails() !== expected, `expected validation to be ${expected} for ${field} with "${value}"\n` + JSON.stringify(result.messages()))
      }
    }

    function * fails (field, value) {
      yield validate(false, field, value)
    }

    function * succeeds (field, value) {
      yield validate(true, field, value)
    }

    it('should validate username', function * () {
      yield fails('username', [ undefined, '', ' ', 'four' ])
      yield succeeds('username', [ 'user@example.com' ])
    })

    it('should validate email', function * () {
      yield fails('email', [ undefined, '', ' ', 'a', 'mail@localhost' ])
      yield succeeds('email', [ 'a@b.com', 'user-1234abcd@example.com' ])
    })

    it('should validate password', function * () {
      yield fails('password', [ undefined, '', ' ', '1234567' ])
      yield succeeds('password', '12345678')
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
