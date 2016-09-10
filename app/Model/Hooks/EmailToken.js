'use strict'

const uuid = require('node-uuid')

const EmailToken = exports = module.exports = {}

EmailToken.createToken = function * (next) {
  this.token = uuid.v1()

  yield next
}
