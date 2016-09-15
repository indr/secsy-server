'use strict'

/* eslint-env mocha */

const assert = require('chai').assert
const agency = require('./agency')
const emailParser = require('./../test-helpers/email')
require('co-mocha')

describe('Acceptance | Delete account', function () {
  let Config, user

  before(function * () {
    Config = use('Config')
  })

  beforeEach(function * () {
    user = yield agency.user()
    yield user.deleteAccount()
  })

  it('should send user notification to notify that the account was deleted', function * () {
    const email = yield user.getEmail()

    assert.equal(email.subject, 'Your account has been deleted')
  })

  it('should send system message to notify about the account deletion', function * () {
    const email = yield emailParser.getEmail(Config.get('mail.log.toPath'), 'recent', (each) => {
      return each.indexOf('To: ' + 'admin@secsy.io') >= 0
    })

    assert.equal(email.subject, 'Notification: Account deleted')
  })

  it('should not be able to login because the account does not exist anymore', function * () {
    const res = yield user.login()

    assert.equal(res.status, 403)
    assert.equal(res.body.status, 403)
    assert.equal(res.body.message, 'user-not-confirmed')
  })
})
