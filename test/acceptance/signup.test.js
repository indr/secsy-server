'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const agency = require('./agency')
require('co-mocha')

describe('Acceptance | signup', function () {
  let user

  beforeEach(function * () {
    user = yield agency.anon()
    yield user.signup()
  })

  it('should receive email to confirm new account', function * () {
    const email = yield user.getEmail()

    assert.equal(email.subject, 'Confirm your new account')
  })

  it('should not be able to login because email address is not confirmed', function * () {
    const res = yield user.login()

    assert.equal(res.status, 403)
    assert.equal(res.body.status, 403)
    assert.equal(res.body.message, 'user-not-confirmed')
  })
})
