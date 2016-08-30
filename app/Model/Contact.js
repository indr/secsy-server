/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const Lucid = use('Lucid')

class Contact extends Lucid {
  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'Base.generateId')
  }

  static scopeOwnedBy (builder, ownerId) {
    builder.where('owned_by', ownerId)
  }

  static scopeId (builder, id) {
    builder.where('id', id)
  }
}

module.exports = Contact
