'use strict'

const Hash = use('App/Services/Hash')

const User = exports = module.exports = {}

User.setUsername = function * (next) {
  this.username = this.email

  yield next
}

User.encryptPassword = function * (next) {
  this.password = yield Hash.bcrypt.make(this.password)

  yield next
}

User.setEmailSha256 = function * (next) {
  this.email_sha256 = Hash.sha256.make(this.email)

  yield next
}
