'use strict'
/* eslint-env mocha */

const assert = require('chai').assert
const emailParser = require('./../../test-helpers/email')
require('./../setup')

describe('Integration | Service | SysMsgMailer', function () {
  let Config, Env, User, user,
    sut

  before(function * () {
    Config = use('Config')
    Env = use('Env')
    User = use('App/Model/User')
    user = new User()
    user.email = 'user@example.com'
  })

  beforeEach(function * () {
    sut = make('App/Services/SysMsgMailer')
  })

  after(function * () {
    yield emailParser.clean(Config.get('mail.log.toPath'))
  })

  function * assertRecent (subject) {
    const email = yield emailParser.getEmail(Config.get('mail.log.toPath'), 'recent')
    assert.deepEqual(email.from, [ { address: Env.get('MAIL_FROM_EMAIL'), name: Env.get('MAIL_FROM_NAME') } ])
    assert.deepEqual(email.to, [ { address: 'admin@secsy.io', name: '' } ])
    assert.equal(email.subject, subject)
    return email
  }

  it('#sendUserLoggedIn', function * () {
    var response = yield sut.sendUserLoggedIn(user)
    assert.deepEqual(response.accepted, [ 'admin@secsy.io' ])
    yield assertRecent('Notification: User logged in')
  })

  it('#sendUserSignedUp', function * () {
    var response = yield sut.sendUserSignedUp(user)
    assert.deepEqual(response.accepted, [ 'admin@secsy.io' ])
    yield assertRecent('Notification: User signed up')
  })

  it('#sendAccountDeleted', function * () {
    var response = yield sut.sendAccountDeleted(user, 'Just because')
    assert.deepEqual(response.accepted, [ 'admin@secsy.io' ])
    const email = yield assertRecent('Notification: Account deleted')
    assert.isAbove(email.textBody.indexOf(user.email), -1)
    assert.match(email.textBody, /Just because/)
  })
})

