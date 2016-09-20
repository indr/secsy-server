/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
'use strict'

const Base = require('./Base')

class Update extends Base {
  static get hidden () {
    return [ 'updated_at', 'created_by', 'owned_by' ]
  }

  static get rules () {
    return {
      'from_email_sha256': 'required|min:64|max:64',
      'to_email_sha256': 'required|min:64|max:64',
      'encrypted_': 'required|max:4096'
    }
  }

  static scopeOwnedBy (builder, ownerId) {
    builder.where('owned_by', ownerId)
  }
}

module.exports = Update
