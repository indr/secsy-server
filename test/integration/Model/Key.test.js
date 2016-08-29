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
      user_id: userId,
      email_sha256: emailSha256,
      private_key: 'PRIVATE KEY',
      public_key: 'PUBLIC KEY'
    })

    let fromDb = yield Key.find(key.id)
    assert.lengthOf(fromDb.id, 36)
    assert.equal(fromDb.user_id, userId)
    assert.equal(fromDb.email_sha256, emailSha256)
    assert.equal(fromDb.is_public, false)
    assert.equal(fromDb.private_key, 'PRIVATE KEY')
    assert.equal(fromDb.public_key, 'PUBLIC KEY')
  })
})
