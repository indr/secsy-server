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
    const user = request.currentUser
    const id = request.param('id')

    const key = yield Key.query().isPublicOrOwnedBy(user.id).where('id', id).first()

    if (!key) {
      response.notFound()
      return
    }

    response.ok(key.toJSON())
  }
}

module.exports = KeysController
