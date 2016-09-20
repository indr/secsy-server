/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const Base = require('./Base')

class Contact extends Base {
  static get rules () {
    return {
      'encrypted_': 'required|max:4096'
    }
  }

  static scopeOwnedBy (builder, ownerId) {
    builder.where('owned_by', ownerId)
  }

  static scopeMe (builder, ownerId) {
    builder.where({ 'owned_by': ownerId, 'me': true })
  }

  static scopeId (builder, id) {
    builder.where('id', id)
  }
}

module.exports = Contact
