/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const Key = use('App/Model/Key')
const Event = use('Event')
const Validator = use('App/Services/Validator')

class KeysController {
  * index (request, response) {
    const user = request.currentUser

    if (!user.sync_enabled) {
      response.forbidden({ status: 403, message: 'sync-disabled' })
      return
    }

    const hash = request.input('h')
    yield Validator.validateAll({ h: hash }, { h: 'required|email_hash' })
    const keys = yield Key.query().isPublicOrOwnedBy(user.id, hash).fetch()

    response.ok(keys.toJSON())
  }

  * store (request, response) {
    const user = request.currentUser
    const data = request.only('private_key', 'public_key')
    data.created_by = user.id
    data.owned_by = user.id
    data.email_sha256 = user.email_sha256
    data.is_public = user.sync_enabled

    yield Validator.validate(data, Key.rules)

    let key = yield Key.query().ownedBy(user.id).first()
    if (key) {
      yield key.delete()
    }

    key = yield Key.create(data)
    Event.fire('key.created', user, key)

    response.created(key.toJSON())
  }

  * show (request, response) {
    const currentUser = request.currentUser
    const id = request.param('id')

    let key
    if (id === 'my') {
      key = yield Key.query().ownedBy(currentUser.id).first()
    } else {
      key = yield Key.query().isPublicOrOwnedBy(currentUser.id).where('id', id).first()
    }

    if (!key) {
      response.notFound()
      return
    }

    if (key.owned_by !== currentUser.id && !currentUser.sync_enabled) {
      response.forbidden({ status: 403, message: 'sync-disabled' })
      return
    }

    response.ok(key.toJSON(currentUser.id))
  }

  * update (request, response) {
    const currentUserId = request.currentUser.id
    const id = request.param('id')

    const data = request.only('public_key', 'private_key')
    yield Validator.validateAll(data, Key.updateRules)

    const key = yield Key.query().ownedBy(currentUserId).where('id', id).first()
    if (!key) {
      response.forbidden()
      return
    }

    key.private_key = data.private_key
    key.public_key = data.public_key
    yield key.save()

    response.ok(key.toJSON(currentUserId))
  }
}

module.exports = KeysController
