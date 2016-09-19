'use strict'

const createHash = require('sha.js')

// This doesn't provide any security, it's
// just to mitigate rainbow table look ups
const obsoleteSalt = 'v07k2x0zgR'

module.exports = function sha256 (value, salt) {
  salt = salt || obsoleteSalt
  return createHash('sha256').update(salt + value).digest('hex')
}
