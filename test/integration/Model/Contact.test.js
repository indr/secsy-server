'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const setup = require('./../setup')
const uuid = require('node-uuid')
const validation = require('./../validation')
require('co-mocha')

const fails = validation.fails
const succeeds = validation.succeeds

describe('Integration | Model | Contact', function () {
  let userId, Contact

  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    Contact = use('App/Model/Contact')
    const User = use('App/Model/User')
    userId = (yield User.create({ email: uuid.v4() + '@example.com', password: 'Secret123$' })).id
  })

  describe('rules', function () {
    it('should validate encrypted_', function * () {
      const len = Array(4097).join('x')
      yield fails(Contact, Contact.rules, 'encrypted_', [ undefined, '', len + 'y' ])
      yield succeeds(Contact, Contact.rules, 'encrypted_', [ 'a', len ])
    })
  })

  it('should be able to create and retrieve a new key', function * () {
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
