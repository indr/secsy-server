/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const setup = require('./../setup')
const uuid = require('node-uuid')
const sha256 = require('./../../../lib/sha256')
require('co-mocha')

describe('Integration | Model | User', function () {
  let User
  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    User = use('App/Model/User')
  })

  it('should be able to create and save a new user', function * () {
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
