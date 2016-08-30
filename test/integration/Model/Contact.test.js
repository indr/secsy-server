/**
 * Copyright 2016 Reto Inderbitzin
 */
/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const setup = require('./../setup')
const uuid = require('node-uuid')
require('co-mocha')

describe('Integration | Model | Contact', function () {
  let Contact

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    Contact = use('App/Model/Contact')
  })

  it('should be able to create and retrieve a new key', function * () {
    const userId = uuid.v4()
    let contact = yield Contact.create({
      owned_by: userId,
      encrypted_: 'cypher'
    })

    let fromDb = yield Contact.find(contact.id)
    assert.lengthOf(fromDb.id, 36)
    assert.equal(fromDb.owned_by, userId)
    assert.equal(fromDb.me, false)
    assert.equal(fromDb.encrypted_, 'cypher')
  })
})
