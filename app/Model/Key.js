/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const omit = require('lodash').omit
const Lucid = use('Lucid')

class Key extends Lucid {

  toJSON (values) {
    return omit(super.toJSON(values), 'private_key')
  }

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'Base.generateId')
  }

  static scopeOwnedBy (builder, ownerId) {
    builder.where('owned_by', ownerId)
  }
}

module.exports = Key
