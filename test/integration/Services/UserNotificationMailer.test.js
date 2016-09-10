'use strict'
/* eslint-env mocha */

const assert = require('chai').assert
const emailParser = require('./../../test-helpers/email')
const uuid = require('node-uuid')
require('./../setup')

describe('Integration | Service | UserNotificationMailer', function () {
  let Config, Env, User, user,
    sut

  before(function * () {
    Config = use('Config')
    Env = use('Env')
    User = use('App/Model/User')
    user = new User()
    user.email = 'user@example.com'
    user.name = user.email
  })

  beforeEach(function * () {
    sut = make('App/Services/UserNotificationMailer')
  })

  after(function * () {
    yield emailParser.clean(Config.get('mail.log.toPath'))
  })

  function * assertRecent () {
    const email = yield emailParser.getEmail(Config.get('mail.log.toPath'), 'recent')
    assert.deepEqual(email.from, [ { address: Env.get('MAIL_FROM_EMAIL'), name: Env.get('MAIL_FROM_NAME') } ])
    return email
  }

  it('#sendAccountActivation', function * () {
    let token = uuid.v1()
    let response = yield sut.sendAccountActivation(user, token)

    assert.deepEqual(response.accepted, [ user.email ])
    const email = yield assertRecent({})
    assert.deepEqual(email.to, [ { address: user.email, name: '' } ])
    assert.equal(email.subject, 'Confirm your new account')
    assert.isAbove(email.textBody.indexOf(Env.get('BASE_URL') + '/app/account/activate/' + token), -1)
  })
})
