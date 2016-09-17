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

    const hash = request.input('h')
    const keys = yield Key.query().isPublicOrOwnedBy(user.id, hash).fetch()

    response.ok(keys.toJSON())
  }

  * store (request, response) {
    const user = request.currentUser
    const data = request.only('private_key', 'public_key', 'is_public')
    data.created_by = user.id
    data.owned_by = user.id
    data.email_sha256 = user.email_sha256
    data.is_public = data.is_public || false

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
    const currentUserId = request.currentUser.id
    const id = request.param('id')

    let key
    if (id === 'my') {
      key = yield Key.query().ownedBy(currentUserId).first()
    } else {
      key = yield Key.query().isPublicOrOwnedBy(currentUserId).where('id', id).first()
    }

    if (!key) {
      response.notFound()
      return
    }

    response.ok(key.toJSON())
  }

  * update (request, response) {
    const currentUserId = request.currentUser.id
    const id = request.param('id')
    if (id !== 'my') {
      response.forbidden()
      return
    }

    const data = request.only('public_key', 'private_key')
    yield Validator.validateAll(data, Key.updateRules)

    const key = yield Key.query().ownedBy(currentUserId).first()
    key.private_key = data.private_key
    key.public_key = data.public_key
    yield key.save()

    response.ok(key.toJSON(currentUserId))
  }
}

module.exports = KeysController
