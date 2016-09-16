'use strict'
/* eslint-env mocha */

const assert = require('chai').assert
const emailParser = require('./../../test-helpers/email')
const uuid = require('node-uuid')
require('./../setup')

describe('Integration | Service | UserNotificationMailer', function () {
  let Config, Env, User, user, token,
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
    token = uuid.v1()
    sut = make('App/Services/UserNotificationMailer')
  })

  after(function * () {
    yield emailParser.clean(Config.get('mail.log.toPath'))
  })

  function assertAccepted (response, to) {
    assert.deepEqual(response.accepted, [ to ])
  }

  function * assertRecent (to) {
    const email = yield emailParser.getEmail(Config.get('mail.log.toPath'), 'recent')
    assert.deepEqual(email.from, [ { address: Env.get('MAIL_FROM_EMAIL'), name: Env.get('MAIL_FROM_NAME') } ])
    assert.deepEqual(email.to, [ { address: to, name: '' } ])
    return email
  }

  describe('#sendAccountActivation', function () {
    it('should send English', function * () {
      user.locale = 'en-US'

      let response = yield sut.sendAccountActivation(user, token)
      assertAccepted(response, user.email)

      const email = yield assertRecent(user.email)
      assert.equal(email.subject, 'Confirm your new account')
      assert.match(email.textBody, /^Welcome to secsy!/)
      assert.isAbove(email.textBody.indexOf(Env.get('BASE_URL') + '/app/activate/' + token), -1)
    })

    it('should send German', function * () {
      user.locale = 'de-DE'

      let response = yield sut.sendAccountActivation(user, token)
      assertAccepted(response, user.email)

      const email = yield assertRecent(user.email)
      assert.equal(email.subject, 'Bestätigen Sie Ihr neues Konto')
      assert.match(email.textBody, /^Willkommen bei secsy!/)
      assert.isAbove(email.textBody.indexOf(Env.get('BASE_URL') + '/app/activate/' + token), -1)
    })
  })

  describe('#sendResetPassword', function () {
    it('should send English', function * () {
      user.locale = 'en-US'

      let response = yield sut.sendResetPassword(user, token)
      assertAccepted(response, user.email)

      const email = yield assertRecent(user.email)
      assert.equal(email.subject, 'Reset password')
      assert.match(email.textBody, /^Somebody asked to reset your password/)
      assert.isAbove(email.textBody.indexOf(Env.get('BASE_URL') + '/app/password-reset/' + token), -1)
    })

    it('should send German', function * () {
      user.locale = 'de-DE'

      let response = yield sut.sendResetPassword(user, token)
      assertAccepted(response, user.email)

      const email = yield assertRecent(user.email)
      assert.equal(email.subject, 'Passwort-Zurücksetzung')
      assert.match(email.textBody, /^Jemand hat eine Passwort-Zurücksetzung angefordert/)
      assert.isAbove(email.textBody.indexOf(Env.get('BASE_URL') + '/app/password-reset/' + token), -1)
    })
  })

  describe('#sendAccountDeleted', function () {
    it('should send English', function * () {
      user.locale = 'en-US'

      let response = yield sut.sendAccountDeleted(user)
      assertAccepted(response, user.email)

      const email = yield assertRecent(user.email)
      assert.equal(email.subject, 'Account deleted')
      assert.match(email.textBody, /^Your secsy account has been deleted/)
    })

    it('should send German', function * () {
      user.locale = 'de-DE'

      let response = yield sut.sendAccountDeleted(user)
      assertAccepted(response, user.email)

      const email = yield assertRecent(user.email)
      assert.equal(email.subject, 'Konto entfernt')
      assert.match(email.textBody, /^Ihr secsy Konto wurde entfernt/)
    })
  })
})
