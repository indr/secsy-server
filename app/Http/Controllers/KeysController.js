/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const _ = require('lodash')
const Key = use('App/Model/Key')
const Event = use('Event')
const Validator = use('Validator')

class KeysController {
  * index (request, response) {
    const user = yield request.auth.getUser()

    const hash = request.input('h')
    const keys = yield Key.query().isPublicOrOwnedBy(user.id, hash)

    response.ok(_.map(keys, (each) => {
      return _.omit(each, 'private_key')
    }))
  }

  * store (request, response) {
    const user = yield request.auth.getUser()
    const data = request.only('private_key', 'public_key', 'is_public')
    data.owned_by = user.id
    data.email_sha256 = user.email_sha256
    data.is_public = data.is_public || false

    const validation = yield Validator.validate(data, Key.rules)
    if (validation.fails()) {
      response.badRequest(validation.messages())
      return
    }

    let key = yield Key.query().ownedBy(user.id).first()
    if (key) {
      yield key.delete()
    }

    key = yield Key.create(data)
    Event.fire('key.created', user, key)

    response.created(key)
  }

  * show (request, response) {
    const user = yield request.auth.getUser()
    const id = request.param('id')

    const key = yield Key.query().isPublicOrOwnedBy(user.id).where('id', id).first()

    if (!key) {
      response.notFound()
      return
    }

    response.ok(key)
  }
}

module.exports = KeysController
