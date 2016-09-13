'use strict'

const SysMsgMailer = use('App/Services/SysMsgMailer')

const Mailer = exports = module.exports = {}

Mailer.sendSystemMessageUserLoggedIn = function * (user) {
  return yield SysMsgMailer.sendUserLoggedIn(user)
}

Mailer.sendSystemMessageUserSignedUp = function * (user) {
  return yield SysMsgMailer.sendUserSignedUp(user)
}
