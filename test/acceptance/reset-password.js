'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const agency = require('./agency')
require('co-mocha')

describe('Acceptance | Reset password', function () {
  let user

  beforeEach(function * () {
    user = yield agency.user()
    yield user.logout()
    yield user.forgotPassword()
  })

  it('should receive email to reset password', function * () {
    const email = yield user.getEmail()
    assert.equal(email.subject, 'Password reset')
  })

  it('should be able to login with new password', function * () {
    const token = yield user.getRecentToken()
    yield user.resetPassword(token, 'new secret')

    const res = yield user.login('new secret')

    assert.equal(res.status, 200)
  })
})
