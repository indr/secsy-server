'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const agency = require('./agency')
require('co-mocha')

describe('Acceptance | Email confirmation', function () {
  let user

  beforeEach(function * () {
    user = yield agency.anon()
    yield user.signup()
  })

  it('should be able to login after confirmation', function * () {
    yield user.confirm()

    yield user.login()
  })

  it('should accept token only once', function * () {
    yield user.confirm()

    const res = yield user.confirm()

    assert.equal(res.status, 400)
    assert.equal(res.body.status, 400)
    assert.equal(res.body.message, 'Email token is already confirmed')
  })

  it.skip('should not confirm previous tokens', function * () {
  })
})
