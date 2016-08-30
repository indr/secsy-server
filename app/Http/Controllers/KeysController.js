/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

const Key = use('App/Model/Key')
const Event = use('Event')

class KeysController {
  * store (request, response) {
    const user = yield request.auth.getUser()
    const data = request.only('private_key', 'public_key')
    data.owned_by = user.id
    data.email_sha256 = user.email_sha256
    data.is_public = false

    let key = yield Key.query().ownedBy(user.id).first()
    if (key) {
      yield key.delete()
    }
    key = yield Key.create(data)
    Event.fire('key.created', user, key)

    response.created(key)
  }
}

module.exports = KeysController
