/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
'use strict'

const assert = require('chai').assert
const isArray = require('lodash').isArray
const pick = require('lodash').pick

function * validate (Model, rules, expected, field, values) {
  const Validator = use('Validator')

  values = isArray(values) ? values : [ values ]
  const data = {}
  rules = pick(rules, field)
  for (var i = 0; i < values.length; i++) {
    let value = values[ i ]
    data[ field ] = value
    const result = yield Validator.validateAll(data, rules)
    assert(result.fails() !== expected, `expected validation to be ${expected} for ${field} with "${value}"\n` + JSON.stringify(result.messages()))
  }
}

function * fails (Model, rules, field, value) {
  yield validate(Model, rules, false, field, value)
}

function * succeeds (Model, rules, field, value) {
  yield validate(Model, rules, true, field, value)
}

module.exports = {
  validate, fails, succeeds
}
