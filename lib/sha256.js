'use strict'

const createHash = require('sha.js')

module.exports = function sha256 (value) {
  return createHash('sha256').update(value).digest('hex')
}
