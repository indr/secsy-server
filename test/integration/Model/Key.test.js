/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const setup = require('./../setup')
const uuid = require('node-uuid')
require('co-mocha')

describe('Integration | Model | Key', function () {
  let Key

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    Key = use('App/Model/Key')
  })

  it('should be able to create and retrieve a new key', function * () {
    const userId = uuid.v4()
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
    const userId = uuid.v4()
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
