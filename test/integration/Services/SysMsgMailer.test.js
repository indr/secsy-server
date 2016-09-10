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

  function * assertRecent () {
    const email = yield emailParser.getEmail(Config.get('mail.log.toPath'), 'recent')
    assert.deepEqual(email.from, [ { address: Env.get('MAIL_FROM_EMAIL'), name: Env.get('MAIL_FROM_NAME') } ])
    assert.deepEqual(email.to, [ { address: 'admin@secsy.io', name: '' } ])
    return email
  }

  it('#sendUserLoggedIn', function * () {
    var result = yield sut.sendUserLoggedIn(user)
    assert.deepEqual(result.accepted, [ 'admin@secsy.io' ])
    yield assertRecent()
  })

  it('#sendUserSignedUp', function * () {
    var result = yield sut.sendUserSignedUp(user)
    assert.deepEqual(result.accepted, [ 'admin@secsy.io' ])
    yield assertRecent()
  })
})

