/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
'use strict'

const assert = require('chai').assert
const isArray = require('lodash').isArray
const pick = require('lodash').pick

function * validate (Model, expected, field, values) {
  const Validator = use('Validator')

  values = isArray(values) ? values : [ values ]
  const data = {}
  const rules = pick(Model.rules, field)
  for (var i = 0; i < values.length; i++) {
    let value = values[ i ]
    data[ field ] = value
    const result = yield Validator.validateAll(data, rules)
    assert(result.fails() !== expected, `expected validation to be ${expected} for ${field} with "${value}"\n` + JSON.stringify(result.messages()))
  }
}

function * fails (Model, field, value) {
  yield validate(Model, false, field, value)
}

function * succeeds (Model, field, value) {
  yield validate(Model, true, field, value)
}

module.exports = {
  validate, fails, succeeds
}
