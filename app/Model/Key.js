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

  static get rules () {
    return {
      'email_sha256': 'required|min:64|max:64'
    }
  }

  static scopeOwnedBy (builder, ownerId) {
    builder.where('owned_by', ownerId)
  }

  static scopeIsPublicOrOwnedBy (builder, ownerId, emailSha256) {
    console.log(emailSha256)
    if (emailSha256) {
      builder.orWhere({ 'owned_by': ownerId, 'is_public': true })
        .where('email_sha256', emailSha256)
    } else {
      builder.where(function () {
        this.where('owned_by', ownerId).orWhere('is_public', true)
      })
    }
  }
}

module.exports = Key
