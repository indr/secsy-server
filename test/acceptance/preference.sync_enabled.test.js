'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const context = require('../contexts').acceptance

require('co-mocha')

context('Acceptance | Preference | sync_enabled', function () {
  describe('Preference set at signup false', function () {
    let user

    before(function * () {
      user = yield this.agency.user({ sync_enabled: false })
    })

    it('should set preference to false', function * () {
      const res = yield user.getMe()
      assert.equal(res.sync_enabled, false)
    })

    it('should set key is_public to false', function * () {
      const res = yield user.getKey()
      assert.equal(res.is_public, false)
    })
  })

  describe('Preference set at signup true', function () {
    let user

    before(function * () {
      user = yield this.agency.user({ sync_enabled: true })
    })

    it('should set preference to false', function * () {
      const res = yield user.getMe()
      assert.equal(res.sync_enabled, true)
    })

    it('should set key is_public to false', function * () {
      const res = yield user.getKey()
      assert.equal(res.is_public, true)
    })
  })

  describe('Change preference to false', function () {
    let user

    before(function * () {
      user = yield this.agency.user({ sync_enabled: true })
      yield user.setPreferences({ sync_enabled: false })
    })

    it('should set preference to false', function * () {
      const res = yield user.getMe()
      assert.equal(res.sync_enabled, false)
    })

    it('should set key is_public to false', function * () {
      const res = yield user.getKey()
      assert.equal(res.is_public, false)
    })
  })

  describe('Change preference to true', function () {
    let user

    before(function * () {
      user = yield this.agency.user({ sync_enabled: false })
      yield user.setPreferences({ sync_enabled: true })
    })

    it('should set preference to false', function * () {
      const res = yield user.getMe()
      assert.equal(res.sync_enabled, true)
    })

    it('should set key is_public to false', function * () {
      const res = yield user.getKey()
      assert.equal(res.is_public, true)
    })
  })
})
