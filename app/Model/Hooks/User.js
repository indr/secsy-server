'use strict'

const Hash = use('Hash')
const sha256 = require('./../../../lib/sha256')

const User = exports = module.exports = {}

User.setUsername = function * (next) {
  this.username = this.email

  yield next
}

User.encryptPassword = function * (next) {
  // TODO: Add some salt and pepper?
  this.password = yield Hash.make(this.password)

  yield next
}

User.setEmailSha256 = function * (next) {
  this.email_sha256 = sha256(this.email)

  yield next
}
