/**
 * Copyright 2016 Reto Inderbitzin
 */
'use strict'

class KeysController {
  * store (request, response) {
    const user = yield request.auth.getUser()
    const data = request.only('private_key', 'public_key')
    data.user_id = user.id
    data.email_sha256 = user.email_sha256
    data.is_public = false

    response.created(data)
  }
}

module.exports = KeysController
