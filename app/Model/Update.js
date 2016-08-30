/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
'use strict'

const Lucid = use('Lucid')

class Update extends Lucid {
  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'Base.generateId')
  }

  static get rules () {
    return {
      'from_email_sha256': 'required|min:64|max:64',
      'to_email_sha256': 'required|min:64|max:64',
      'encrypted_': 'required'
    }
  }

  static scopeOwnedBy (builder, ownerId) {
    builder.where('owned_by', ownerId)
  }
}

module.exports = Update
