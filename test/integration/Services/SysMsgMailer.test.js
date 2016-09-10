'use strict'
/* eslint-env mocha */

const assert = require('chai').assert
require('./../setup')

describe('Integration | Service | Mailer', function () {
  let sut, User, user

  before(function * () {
    User = use('App/Model/User')
    user = new User()
    user.email = 'user@example.com'
  })

  beforeEach(function * () {
    sut = make('App/Services/SysMsgMailer')
  })

  describe('System message', function () {
    it('#sendUserLoggedIn', function * () {
      var result = yield sut.sendUserLoggedIn(user)
      assert.lengthOf(result.accepted, 1)
    })

    it('#sendUserSignedUp', function * () {
      var result = yield sut.sendUserSignedUp(user)
      assert.lengthOf(result.accepted, 1)
    })
  })
})

