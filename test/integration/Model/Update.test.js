'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const context = require('../../contexts').integration
const uuid = require('node-uuid')
const validation = require('./../validation')

const fails = validation.fails
const succeeds = validation.succeeds

require('co-mocha')

context('Integration | Model | Update', function () {
  let Update

  before(function * () {
    Update = use('App/Model/Update')
  })

  describe('rules', function () {
    it('should validate from_email_sha256', function * () {
      yield fails(Update, Update.rules, 'from_email_sha256', [ undefined, '', ' ', 'abc123', Array(66).join('x') ])
      yield succeeds(Update, Update.rules, 'from_email_sha256', Array(65).join('x'))
    })

    it('should validate to_email_sha256', function * () {
      yield fails(Update, Update.rules, 'to_email_sha256', [ undefined, '', ' ', 'abc123', Array(66).join('x') ])
      yield succeeds(Update, Update.rules, 'to_email_sha256', Array(65).join('x'))
    })

    it('should validate encrypted_', function * () {
      const len = Array(4097).join('x')
      yield fails(Update, Update.rules, 'encrypted_', [ undefined, '', len + 'y' ])
      yield succeeds(Update, Update.rules, 'encrypted_', [ 'a', len ])
    })
  })

  describe('crud', function () {
    it('should be able to create a new update', function * () {
      const creatorId = uuid.v4()
      const ownerId = uuid.v4()
      let update = yield Update.create({
        created_by: creatorId,
        owned_by: ownerId,
        from_email_sha256: 'from',
        to_email_sha256: 'to',
        encrypted_: 'cypher'
      })

      let fromDb = yield Update.find(update.id)
      assert.lengthOf(fromDb.id, 36)
      assert.equal(fromDb.created_by, creatorId)
      assert.equal(fromDb.owned_by, ownerId)
      assert.equal(fromDb.from_email_sha256, 'from')
      assert.equal(fromDb.to_email_sha256, 'to')
      assert.equal(fromDb.encrypted_, 'cypher')
    })
  })
})
