'use strict'

const Contact = use('App/Model/Contact')

class ContactsController {
  * index (request, response) {
    const user = yield request.auth.getUser()

    const contacts = yield Contact.query().ownedBy(user.id)

    response.ok(contacts)
  }

  * store (request, response) {
    const user = yield request.auth.getUser()

    const data = request.only('encrypted_')
    data.created_by = user.id
    data.owned_by = user.id
    data.me = false

    // TODO: Validation

    const contact = yield Contact.create(data)

    response.created(contact)
  }

  * show (request, response) {
    const user = yield request.auth.getUser()
    const id = request.param('id')

    const contact = yield Contact.query().ownedBy(user.id).where({ 'id': id }).first()

    if (!contact) {
      response.notFound()
      return
    }

    response.ok(contact)
  }

  * update (request, response) {
    const user = yield request.auth.getUser()
    const id = request.param('id')

    const contact = yield Contact.query().ownedBy(user.id).id(id).first()

    if (!contact) {
      response.notFound()
      return
    }

    contact.encrypted_ = request.input('encrypted_')
    yield contact.save()

    response.ok(contact)
  }

  * destroy (request, response) {
    const user = yield request.auth.getUser()
    const id = request.param('id')

    const contact = yield Contact.query().ownedBy(user.id).id(id).first()

    if (!contact) {
      response.notFound()
      return
    }

    yield contact.delete()

    response.ok(contact)
  }
}

module.exports = ContactsController
