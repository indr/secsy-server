'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const context = require('../contexts').acceptance

require('co-mocha')

context('Acceptance | Reset password', function () {
  let user

  beforeEach(function * () {
    user = yield agency.user()
    yield user.logout()
    yield user.forgotPassword()
  })

  it('should receive email to reset password', function * () {
    const email = yield user.getEmail()
    assert.equal(email.subject, 'Reset password')
  })

  it('should be able to login with new password', function * () {
    const token = yield user.getRecentToken()
    yield user.resetPassword(token, 'newSecret1234$')

    const res = yield user.login('newSecret1234$')

    assert.equal(res.status, 200)
  })
})
