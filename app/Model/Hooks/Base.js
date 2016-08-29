'use strict'

const uuid = require('node-uuid')

const Base = exports = module.exports = {}

Base.generateId = function * (next) {
  this.id = uuid.v4()

  yield next
}
