'use strict'

const AdonisValidator = use('Validator')
const Exceptions = use('App/Exceptions')
const Validator = exports = module.exports = {}

Validator.validate = function * (data, rules) {
  const validation = yield AdonisValidator.validate(data, rules)
  if (validation.fails()) {
    throw Exceptions.ValidationException.failed(validation.messages())
  }
}

Validator.validateAll = function * (data, rules) {
  const validation = yield AdonisValidator.validateAll(data, rules)
  if (validation.fails()) {
    throw Exceptions.ValidationException.failed(validation.messages())
  }
}

Validator.sanitize = AdonisValidator.sanitize
