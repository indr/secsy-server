'use strict'

const Contact = use('App/Model/Contact')

class ContactsController {
  * index (request, response) {
    const user = request.currentUser

    const contacts = yield Contact.query().ownedBy(user.id).fetch()

    response.ok(contacts.toJSON())
  }

  * store (request, response) {
    const user = request.currentUser

    const data = request.only('encrypted_')
    data.created_by = user.id
    data.owned_by = user.id
    data.me = false

    const contact = yield Contact.create(data)

    response.created(contact.toJSON())
  }

  * show (request, response) {
    const user = request.currentUser
    const id = request.param('id')

    const contact = yield Contact.query().ownedBy(user.id).where({ 'id': id }).first()

    if (!contact) {
      response.notFound()
      return
    }

    response.ok(contact.toJSON())
  }

  * update (request, response) {
    const user = request.currentUser
    const id = request.param('id')

    const contact = yield Contact.query().ownedBy(user.id).id(id).first()

    if (!contact) {
      response.notFound()
      return
    }

    contact.encrypted_ = request.input('encrypted_')
    yield contact.save()

    response.ok(contact.toJSON())
  }

  * destroy (request, response) {
    const user = request.currentUser
    const id = request.param('id')

    const contact = yield Contact.query().ownedBy(user.id).id(id).first()

    if (!contact) {
      response.notFound()
      return
    }

    yield contact.delete()

    response.ok(contact.toJSON())
  }
}

module.exports = ContactsController
