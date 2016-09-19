'use strict'

const sha = require('sha.js')
const Env = use('Env')
const AdonisHash = use('Hash')

const sha256 = {}

exports = module.exports = {
  bcrypt: AdonisHash,
  sha256: sha256
}

sha256.make = function (value, salt) {
  salt = salt || Env.get('HASH_SALT')
  return sha('sha256').update(salt + value).digest('hex')
}

sha256.verify = function (value, hash, salt) {
  salt = salt || Env.get('HASH_SALT')
  return hash === sha256.make(value, salt)
}
