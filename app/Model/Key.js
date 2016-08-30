/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const Lucid = use('Lucid')

class Key extends Lucid {

  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'Base.generateId')
  }

  static get hidden () {
    return [ 'private_key' ]
  }

  static scopeOwnedBy (builder, ownerId) {
    builder.where('owned_by', ownerId)
  }
}

module.exports = Key
