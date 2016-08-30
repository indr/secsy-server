/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
'use strict'

const Update = use('App/Model/Update')
const User = use('App/Model/User')
const uuid = require('node-uuid')
const Validator = use('Validator')

class UpdatesController {
  * index (request, response) {
    const user = yield request.auth.getUser()

    const updates = yield Update.query().ownedBy(user.id)

    response.ok(updates)
  }

  * store (request, response) {
    const user = yield request.auth.getUser()
    const receiver = yield User.findBy('email_sha256', request.input('email_sha256'))

    if (!receiver) {
      // We don't disclose anything
      response.created({})
    }

    const data = request.only('encrypted_')
    data.created_by = user.id
    data.owned_by = receiver.id
    data.from_email_sha256 = user.email_sha256
    data.to_email_sha256 = receiver.email_sha256

    const validation = yield Validator.validate(data, Update.rules)
    if (validation.fails()) {
      console.log('validation failed', validation.messages())
      // We don't disclose anything
      response.created({})
      // response.badRequest(validation.messages())
      return
    }

    yield Update.create(data)

    // We don't disclose anything
    response.created({})
  }

  * destroy (request, response) {
    const user = yield request.auth.getUser()
    const id = uuid.unparse(uuid.parse(request.param('id')))

    const update = yield Update.query().ownedBy(user.id).where('id', id).first()

    if (!update) {
      response.notFound()
      return
    }

    yield update.delete()

    response.ok({})
  }
}

module.exports = UpdatesController
