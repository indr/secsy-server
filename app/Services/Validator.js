'use strict'

/**
 * http://indicative.adonisjs.com/#indicative-extending-extending-schema-validator
 * https://github.com/poppinss/indicative/blob/develop/src/Validations/index.js
 */

const AdonisValidator = use('Validator')
const Exceptions = use('App/Exceptions')

const Raw = AdonisValidator.is

const skippable = function (value) {
  return !Raw.existy(value) && value !== null
}

AdonisValidator.is.extend('emailHash', function (data) {
  const emailHashRegex = /^[0-9a-z]{64}$/i
  return emailHashRegex.test(data)
})

AdonisValidator.extend('emailHash', function (data, field, message, args, get) {
  return new Promise((resolve, reject) => {
    const fieldValue = get(data, field)
    if (skippable(fieldValue)) {
      resolve('validation skipped')
      return
    }
    if (Raw.emailHash(fieldValue)) {
      resolve('validation passed')
      return
    }
    reject(message)
  })
})

AdonisValidator.is.extend('password', function (data) {
  // http://indicative.adonisjs.com/#indicative-extending-extending-raw-validator
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~!@#\$%^&\*\(\)\-_=\+\[\]\{\};:'"\|\\,\.<>\?\/])(?=.{8,})/
  return passwordRegex.test(data)
})

AdonisValidator.extend('password', function (data, field, message, args, get) {
  return new Promise((resolve, reject) => {
    const fieldValue = get(data, field)
    if (skippable(fieldValue)) {
      resolve('validation skipped')
      return
    }
    if (Raw.password(fieldValue)) {
      resolve('validation passed')
      return
    }
    reject(message)
  })
})

AdonisValidator.is.extend('token', function (data) {
  const tokenRegex = /^[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}$/i
  return tokenRegex.test(data)
})

AdonisValidator.extend('token', function (data, field, message, args, get) {
  return new Promise((resolve, reject) => {
    const fieldValue = get(data, field)
    if (skippable(fieldValue)) {
      resolve('validation skipped')
      return
    }
    if (Raw.token(fieldValue)) {
      resolve('validation passed')
      return
    }
    reject(message)
  })
})

AdonisValidator.sanitizor.extend('normalizeLocale', function (value) {
  if (!value) {
    return value
  }
  const values = value.split('-')
  if (values.length !== 2) {
    return value
  }
  return values[ 0 ].toLowerCase() + '-' + values[ 1 ].toUpperCase()
})

const Validator = exports = module.exports = {
  is: Raw,
  sanitizor: AdonisValidator.sanitizor
}

Validator.validate = function * (data, rules) {
  const validation = yield AdonisValidator.validate(data, rules)
  if (validation.fails()) {
    throw Exceptions.ValidationException.failed(validation.messages())
  }
  return true
}

Validator.validateAll = function * (data, rules) {
  const validation = yield AdonisValidator.validateAll(data, rules)
  if (validation.fails()) {
    throw Exceptions.ValidationException.failed(validation.messages())
  }
}

Validator.sanitize = AdonisValidator.sanitize
