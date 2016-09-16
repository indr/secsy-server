/**
 * Copyright 2016 Reto Inderbitzin <mail@indr.ch>
 */
'use strict'

const uuid = require('node-uuid')
const Update = use('App/Model/Update')
const User = use('App/Model/User')
const Validator = use('App/Services/Validator')

class UpdatesController {
  * index (request, response) {
    const user = request.currentUser

    const updates = yield Update.query().ownedBy(user.id).fetch()

    response.ok(updates.toJSON())
  }

  * store (request, response) {
    const user = request.currentUser
    const receiver = yield User.findBy('email_sha256', request.input('to_email_sha256'))

    if (!receiver) {
      // We don't disclose anything
      response.created({ id: uuid.v4() })
      return
    }

    const data = request.only('encrypted_')
    data.created_by = user.id
    data.owned_by = receiver.id
    data.from_email_sha256 = user.email_sha256
    data.to_email_sha256 = receiver.email_sha256

    try {
      yield Validator.validate(data, Update.rules)

      const update = yield Update.create(data)

      // Don't disclose anything
      response.created({ id: update.id })
    } catch (error) {
      console.error(error.stack)

      // Don't disclose anything
      response.created({ id: uuid.v4() })
    }
  }

  * destroy (request, response) {
    const user = request.currentUser
    const id = uuid.unparse(uuid.parse(request.param('id')))

    const update = yield Update.query().ownedBy(user.id).where('id', id).first()

    if (!update) {
      response.notFound()
      return
    }

    yield update.delete()

    response.ok({ id })
  }
}

module.exports = UpdatesController
