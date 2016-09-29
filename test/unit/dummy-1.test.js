'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const context = require('../contexts').unit

require('co-mocha')

context('Unit | dummy-1', function () {
  describe('a feature', function () {
    it('should be false', function () {
      assert.isFalse(false)
    })

    it('should be true', function () {
      assert.isTrue(true)
    })
  })
})

