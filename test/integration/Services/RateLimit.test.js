'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const context = require('../../contexts').integration
const uuid = require('node-uuid')

require('co-mocha')

context('Integration | Service | RateLimit', function () {
  let RateLimiter, sut

  before(function * () {
    RateLimiter = use('App/Services/RateLimiter')
    sut = use('App/Services/RateLimit')
  })

  describe('perform', function () {
    it('performs and returns RateLimiter', function * () {
      const rateLimiter = yield sut.perform(uuid.v4(), 'key', 3, 10)

      assert.instanceOf(rateLimiter, RateLimiter)
      assert.equal(yield rateLimiter.getRemaining(), 2)
    })
  })
})

