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

    let res = yield user.login()

    assert.equal(res.status, 200)
    assert.equal(res.body.id, user.id)
  })

  it('should accept token only once', function * () {
    yield user.confirm()

    const res = yield user.confirm()

    assert.equal(res.status, 400)
    assert.equal(res.body.status, 400)
    assert.equal(res.body.message, 'email-token-already-confirmed')
  })

  it('should not confirm previous tokens', function * () {
    let previousToken = yield user.getRecentToken()
    yield user.resend()

    const res = yield user.confirm(previousToken)

    assert.equal(res.status, 400)
    assert.deepEqual(res.body, { status: 400, message: 'email-token-expired' })
  })
})
