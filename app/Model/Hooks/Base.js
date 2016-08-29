'use strict'

const uuid = require('node-uuid')

const Base = exports = module.exports = {}

Base.generateUuidV4 = function * (next) {
  this.id = uuid.v4()

  yield next
}
