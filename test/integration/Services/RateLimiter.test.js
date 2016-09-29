'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const context = require('../../contexts').integration

require('co-mocha')

context('Integration | Service | RateLimiter', function () {
  let Redis

  before(function * () {
    Redis = use('Redis')
  })

  let sut

  function createSut (options) {
    options = options || {}
    const subject = options.subject || null
    const max = options.max || 2
    const secs = options.secs || 10
    const RateLimiter = use('App/Services/RateLimiter')
    return new RateLimiter(subject, 'test', max, secs)
  }

  afterEach(function * () {
    if (sut) {
      yield Redis.del(sut.key)
    }
  })

  describe('constructor', function () {
    it('should build key', function () {
      sut = createSut()

      assert.equal(sut.key, 'rate-limit:null:test')
    })
  })

  describe('perform', function () {
    it('should throw RateLimitExceededException given limit is reached', function * () {
      sut = createSut({ max: 1 })

      yield sut.perform()
      try {
        yield sut.perform()
        assert.fail()
      } catch (error) {
        assert.equal(error.name, 'RateLimitExceededException')
        assert.equal(error.message, 'test-rate-limit-exceeded')
        assert.isAbove(error.secondsToWait, 9)
        assert.equal(error.status, 429)
      }
    })

    it('should not throw RateLimitExceededException given subject is 127.0.0.1', function * () {
      sut = createSut({ subject: '127.0.0.1', max: 1 })

      yield sut.perform()
      yield sut.perform()
    })
  })
})
