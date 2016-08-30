'use strict'

const Contact = use('App/Model/Contact')

class ContactsController {
  * index (request, response) {
    const user = yield request.auth.getUser()

    const contacts = yield Contact.query().where('user_id', user.id)

    response.ok(contacts)
  }

  * store (request, response) {
    const user = yield request.auth.getUser()

    const data = request.only('encrypted_')
    data.user_id = user.id
    data.me = false

    const contact = yield Contact.create(data)

    response.created(contact)
  }

  * show (request, response) {
    const user = yield request.auth.getUser()
    const id = request.param('id')

    const contact = yield Contact.query().where({ 'user_id': user.id, 'id': id }).first()

    if (!contact) {
      response.notFound()
      return
    }

    response.ok(contact)
  }

  * update (request, response) {
    const user = yield request.auth.getUser()
    const id = request.param('id')

    const contact = yield Contact.query().where({ 'user_id': user.id, 'id': id }).first()

    if (!contact) {
      response.notFound()
      return
    }

    contact.encrypted_ = request.input('encrypted_')
    yield contact.save()

    response.ok(contact)
  }

  * destroy (request, response) {
    response.notImplemented()
  }
}

module.exports = ContactsController
