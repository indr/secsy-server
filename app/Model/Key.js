/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const Base = require('./Base')

class Key extends Base {

  toJSON (userId) {
    let result = super.toJSON()
    if (userId === this.owned_by) {
      result.private_key = this.private_key
    }
    return result
  }

  static get hidden () {
    return [ 'created_at', 'updated_at', 'created_by', 'owned_by', 'private_key' ]
  }

  static get rules () {
    return {
      'email_sha256': 'required|min:64|max:64',
      'public_key': 'required',
      'private_key': 'required'
    }
  }

  static get updateRules () {
    return {
      'public_key': 'required',
      'private_key': 'required'
    }
  }

  static scopeOwnedBy (builder, ownerId) {
    builder.where('owned_by', ownerId)
  }

  static scopeIsPublicOrOwnedBy (builder, ownerId, emailSha256) {
    console.log(emailSha256)
    if (emailSha256) {
      builder.where(function () {
        this.orWhere({ 'owned_by': ownerId, 'is_public': true })
      }).where('email_sha256', emailSha256)
    } else {
      builder.where(function () {
        this.where('owned_by', ownerId).orWhere('is_public', true)
      })
    }
  }
}

module.exports = Key
