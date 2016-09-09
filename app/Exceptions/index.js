'use strict'

const NE = use('node-exceptions')

class ValidationException extends NE.LogicalException {
  static failed (fields) {
    const instance = new this('Validation failed', 400)
    instance.fields = fields
    return instance
  }
}

module.exports = { ValidationException }
