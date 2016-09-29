'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const context = require('../../contexts').integration
const uuid = require('node-uuid')
const validation = require('./../validation')

const fails = validation.fails
const succeeds = validation.succeeds

require('co-mocha')

context('Integration | Model | Contact', function () {
  let userId, Contact

  before(function * () {
    Contact = use('App/Model/Contact')
    const User = use('App/Model/User')
    userId = (yield User.create({ email: uuid.v4() + '@example.com', password: 'Secret123$' })).id
  })

  describe('rules', function () {
    it('should validate encrypted_', function * () {
      const len = new Array(4097).join('x')
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
